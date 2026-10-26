import { authoption } from "@/src/app/api/auth/[...nextauth]/authOption";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: wabaId } = await params;
    const session = await getServerSession(authoption);
    const token = session?.accessToken as string;

    const search = request.nextUrl.search;
    const response = await fetch(`${BACKEND_API_URL}/whatsapp/baileys/qrcode/${wabaId}${search}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || data.details || data.error || "Failed to fetch QR code",
          error: data.error,
          details: data.details,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Baileys QR code API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
