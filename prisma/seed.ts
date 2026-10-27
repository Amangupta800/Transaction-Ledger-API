import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create sample accounts
  const alice = await prisma.account.create({
    data: { name: "Alice Johnson" },
  });

  const bob = await prisma.account.create({
    data: { name: "Bob Smith" },
  });

  console.log(`Created accounts: ${alice.name} (${alice.id}), ${bob.name} (${bob.id})`);

  // Seed Alice with an initial credit
  await prisma.$transaction(async (tx) => {
    const amount = 1000;
    await tx.transaction.create({
      data: {
        accountId: alice.id,
        type: "credit",
        amount,
        referenceId: "seed-alice-001",
        description: "Initial deposit",
        balanceBefore: 0,
        balanceAfter: amount,
      },
    });
    await tx.account.update({
      where: { id: alice.id },
      data: { balance: amount },
    });
  });

  // Seed Bob with an initial credit
  await prisma.$transaction(async (tx) => {
    const amount = 500;
    await tx.transaction.create({
      data: {
        accountId: bob.id,
        type: "credit",
        amount,
        referenceId: "seed-bob-001",
        description: "Initial deposit",
        balanceBefore: 0,
        balanceAfter: amount,
      },
    });
    await tx.account.update({
      where: { id: bob.id },
      data: { balance: amount },
    });
  });

  console.log("Alice balance: 1000.00, Bob balance: 500.00");
  console.log("Seeding complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
