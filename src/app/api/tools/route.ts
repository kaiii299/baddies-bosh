import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch all tools from the database
        const tools = await prisma.tools.findMany();

        // Return tools as JSON response
        return NextResponse.json(tools);
    } catch (error) {
        console.error("Failed to fetch tools:", error);
        return NextResponse.json({ error: "Failed to fetch tools data" }, { status: 500 });
    }
}