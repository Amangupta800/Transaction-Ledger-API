import "dotenv/config";
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

async function main() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log("✓ Database connected");

    app.listen(PORT, () => {
      console.log(`✓ Banking API running on http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV ?? "development"}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
