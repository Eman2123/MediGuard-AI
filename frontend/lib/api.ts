const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic API call handler with error handling
 * @param endpoint - The API endpoint (e.g., "/smart-assess")
 * @param options - Fetch options
 * @returns Promise with the response data
 */
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    // Parse response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || data.error || `API error: ${response.status}`
      );
    }

    return data as T;
  } catch (error) {
    console.error(`API call failed to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Check backend health status
 */
export async function checkHealth() {
  try {
    return await apiCall("/health");
  } catch (error) {
    return { status: "unhealthy", error: String(error) };
  }
}

/**
 * Assess a shipment with smart analysis
 */
export async function smartAssessShipment(userInput: string) {
  return apiCall("/smart-assess", {
    method: "POST",
    body: JSON.stringify({ user_input: userInput }),
  });
}

/**
 * Assess a specific shipment with detailed parameters
 */
export async function assessShipment(
  cargoType: string,
  originCity: string,
  destinationCity: string,
  departureTime: string
) {
  return apiCall("/assess-shipment", {
    method: "POST",
    body: JSON.stringify({
      cargo_type: cargoType,
      origin_city: originCity,
      destination_city: destinationCity,
      departure_time: departureTime,
    }),
  });
}

/**
 * Get environment data
 */
export async function getEnvironmentData(filters?: Record<string, string>) {
  const searchParams = new URLSearchParams(filters || {});
  const queryString = searchParams.toString();
  const endpoint = queryString 
    ? `/environment?${queryString}`
    : "/environment";
  
  return apiCall(endpoint);
}

/**
 * Handle API errors gracefully
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}