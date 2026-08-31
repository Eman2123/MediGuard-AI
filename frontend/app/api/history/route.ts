import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/history`, { method: "GET" });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error (history):", error);
    return NextResponse.json(
      { error: "Failed to fetch history", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}