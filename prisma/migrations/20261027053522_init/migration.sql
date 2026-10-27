-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('credit', 'debit');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "reference_id" TEXT NOT NULL,
    "description" TEXT,
    "balance_before" DECIMAL(18,2) NOT NULL,
    "balance_after" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_account_id_idx" ON "transactions"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_account_id_reference_id_key" ON "transactions"("account_id", "reference_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
