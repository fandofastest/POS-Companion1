import { connectMongo } from "@/lib/db/mongoose";
import { TransactionModel, type TransactionDoc } from "@/modules/transactions/transaction.model";

export async function createTransaction(input: {
  storeId: string;
  invoiceNumber: string;
  items: any[];
  totalAmount: number;
  paymentMethod: string;
  cashierId: string;
}) {
  await connectMongo();
  const doc = await TransactionModel.create({
    storeId: input.storeId,
    invoiceNumber: input.invoiceNumber,
    items: input.items,
    totalAmount: input.totalAmount,
    paymentMethod: input.paymentMethod,
    cashierId: input.cashierId,
  });
  return doc as TransactionDoc;
}

export async function listTransactionsBetween(storeId: string, from: Date, to: Date, limit = 100) {
  await connectMongo();
  const rows = await TransactionModel.find({
    deletedAt: null,
    storeId,
    createdAt: { $gte: from, $lt: to },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();

  return rows as unknown as TransactionDoc[];
}

export async function listTransactionsToday(storeId: string, limit = 100) {
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(now);
  to.setHours(24, 0, 0, 0);

  return listTransactionsBetween(storeId, from, to, limit);
}
