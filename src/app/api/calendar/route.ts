import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toolId, isAccepted, riskLevel, predictedCalibrationDate } = body;

    if (!toolId) {
      return NextResponse.json(
        { error: "Tool ID is required" },
        { status: 400 }
      );
    }

    // Format the date if provided
    const formattedDate = predictedCalibrationDate || new Date().toISOString();

    // Check if a calendar entry already exists for this tool
    const existingEntry = await prisma.calendar.findFirst({
      where: {
        serialIdNo: toolId,
      },
    });

    let result;

    if (existingEntry) {
      // Update existing entry
      result = await prisma.calendar.update({
        where: {
          id: existingEntry.id,
        },
        data: {
          isAccepted,
          riskLevel,
          predictedCalibrationDate: formattedDate,
        },
      });
    } else {
      // Create new entry
      result = await prisma.calendar.create({
        data: {
          serialIdNo: toolId,
          isAccepted,
          riskLevel,
          predictedCalibrationDate: formattedDate,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error handling calendar event:", error);
    return NextResponse.json(
      { error: "Failed to process calendar event" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
