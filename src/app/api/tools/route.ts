import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// Initialize PrismaClient
const prisma = new PrismaClient();

export async function GET() {
  try {
    const tools = await prisma.tools.findMany({
      select: {
        serialIdNo: true,
        div: true,
        brand: true,
        description: true,
        modelPartNo: true,
        lastCalibration: true,
      },
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error("Failed to fetch tools:", error);
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}
