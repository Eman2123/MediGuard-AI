import json
from openai import OpenAI
import os
from datetime import datetime, timedelta

# AIML API (OpenAI-compatible)
api_key = os.getenv("AIML_API_KEY")
client = OpenAI(
    api_key=api_key,
    base_url="https://api.aimlapi.com/v1"
)

def parse_shipment_request(user_input: str) -> dict:
    """
    Use Claude to extract structured data from natural language.
    
    Args:
        user_input: User's natural language description
    
    Returns:
        Dictionary with cargo_type, origin_city, destination_city, departure_time
    """
    
    today = datetime.now().strftime("%Y-%m-%d")
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    prompt = f"""
Extract shipment details from this user input. Return ONLY valid JSON, no markdown.

User Input: "{user_input}"

Required fields:
- cargo_type: Must be one of: insulin, vaccine, blood, organ
- origin_city: Must be one of: phoenix, houston, boston, los_angeles, chicago, miami, denver, seattle, new_york, san_francisco
- destination_city: Must be one of: phoenix, houston, boston, los_angeles, chicago, miami, denver, seattle, new_york, san_francisco
- departure_time: ISO format (YYYY-MM-DDTHH:MM:SS)

Context:
- Today's date: {today}
- Tomorrow's date: {tomorrow}

If user says "tomorrow 6am", use: {tomorrow}T06:00:00
If user says "next week Monday 8am", calculate the date
If no time specified, default to 06:00:00 (6am)
If no date specified, default to today

Return JSON object only:
{{
  "cargo_type": "insulin|vaccine|blood|organ",
  "origin_city": "city_name",
  "destination_city": "city_name", 
  "departure_time": "2026-08-25T06:00:00"
}}

If user input is unclear or missing info, make reasonable assumptions and extract what you can.
    """
    
    try:
        # Using AIML API (OpenAI-compatible)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # or "gpt-4-turbo" if you have access
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        json_str = response.choices[0].message.content.strip()
        
        # Try to parse JSON
        result = json.loads(json_str)
        
        # Validate required fields
        required = ["cargo_type", "origin_city", "destination_city", "departure_time"]
        for field in required:
            if field not in result:
                raise ValueError(f"Missing required field: {field}")
        
        return result
    
    except json.JSONDecodeError as e:
        raise Exception(f"Claude returned invalid JSON: {e}")
    except Exception as e:
        raise Exception(f"Claude parsing error: {str(e)}")


def format_response_message(result: dict) -> str:
    """
    Format shipment assessment result as a chat message.
    """
    flagged = result["total_flagged_segments"]
    total = len(result["segments"])
    cost = result["total_cooling_cost"]
    savings = result["savings"]
    full_cost = result["full_route_cooling_cost"]
    
    message = f"""
🌡️ **Analysis Complete for {result['cargo_type'].title()}**

📊 **Route:** {result['origin_city'].title()} → {result['destination_city'].title()}
⏰ **Departure:** {result['departure_time']}

📈 **Segments Analyzed:** {total}
🚨 **Flagged Segments:** {flagged}
📏 **Total Distance:** {result['total_distance_miles']:.1f} miles

💰 **Cost Optimization:**
- **Targeted Cooling:** ${cost:.2f} (cool only flagged segments)
- **Full Route Cooling:** ${full_cost:.2f} (if you cooled everything)
- **💡 Savings:** ${savings:.2f} ({(savings/full_cost*100):.0f}% reduction)

✅ **Recommendation:** {result['recommended_action']}

📋 **Segment Details:**
"""
    
    for seg in result["segments"]:
        if seg["risk_level"] == "unknown":
            status = "⚠️ UNVERIFIED"
        elif seg["is_flagged"]:
            status = "🚨 FLAGGED"
        else:
            status = "✅ SAFE"
        message += f"\n**Segment {seg['segment_id']}** | {seg['distance_miles']:.1f} mi | {seg['max_temp_c']}°C | {status} | ${seg['cooling_cost']:.2f}"
    
    return message