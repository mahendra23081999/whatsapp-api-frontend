import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authoption } from "../../auth/[...nextauth]/authOption";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getServerSession(authoption);
    const token = session?.accessToken as string;

    const response = await fetch(`${BACKEND_API_URL}/whatsapp/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error(`Connect whatsapp: non-JSON response from backend (${response.status}):`, text.slice(0, 500));
      return NextResponse.json(
        { success: false, message: `Backend returned ${response.status}`, details: text.slice(0, 500) },
        { status: response.ok ? 502 : response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.details || data.error || data.message || "Connect whatsapp failed",
          error: data.error,
          details: data.details,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Connect whatsapp API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, message: `Could not reach backend: ${message}` }, { status: 500 });
  }
}
