import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request
    const body = await request.json();

    // Forward to FastAPI backend
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    
    const response = await fetch(`${backendUrl}/api/smart-assess`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Get response data
    const data = await response.json();

    // If backend returned an error, pass it through
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Success
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error (smart-assess):", error);
    
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}