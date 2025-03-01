import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create some test tools
  await prisma.tool.createMany({
    data: [
      {
        description: "Test Tool 1",
        make: "Bosch",
        model: "ABC123",
        serial: "SN001",
        lastCalibration: new Date(),
        calibrationDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
      // Add more test tools as needed
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
