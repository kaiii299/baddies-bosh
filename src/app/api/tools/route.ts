import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// Initialize PrismaClient
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Instead of specifying each field, get all fields by not using select
    const tools = await prisma.tools.findMany();

    return NextResponse.json(tools);

  } catch (error) {
    console.error("Failed to fetch tools:", error);
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
}
