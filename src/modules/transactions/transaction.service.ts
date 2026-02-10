import { HttpError } from "@/utils/httpError";
import { findProductByIdAndStore, adjustStock } from "@/modules/products/product.repository";
import {
  createTransaction,
  listTransactionsBetween,
  listTransactionsToday,
} from "@/modules/transactions/transaction.repository";
import type { TransactionDto, TransactionItemDto } from "@/modules/transactions/transaction.dto";
import { generateInvoiceNumber } from "@/modules/counters/invoiceCounter.service";

function toDto(t: any): TransactionDto {
  return {
    id: t._id.toString(),
    storeId: t.storeId.toString(),
    invoiceNumber: t.invoiceNumber,
    items: (t.items ?? []).map((i: any) => ({
      productId: i.productId.toString(),
      name: i.name,
      sku: i.sku,
      qty: i.qty,
      price: i.price,
      lineTotal: i.lineTotal,
    })) as TransactionItemDto[],
    totalAmount: t.totalAmount,
    paymentMethod: t.paymentMethod,
    cashierId: t.cashierId.toString(),
    createdAt: new Date(t.createdAt).toISOString(),
  };
}

export async function createTransactionService(input: {
  storeId: string;
  invoiceNumber?: string;
  paymentMethod: string;
  items: { productId: string; qty: number; price: number }[];
  cashierId: string;
}) {
  if (input.items.length === 0) throw new HttpError(422, "No items");

  const invoiceNumber = input.invoiceNumber ?? (await generateInvoiceNumber(input.storeId));

  const resolvedItems: any[] = [];
  let totalAmount = 0;

  for (const it of input.items) {
    const prod = await findProductByIdAndStore(it.productId, input.storeId);
    if (!prod) throw new HttpError(404, "Product not found");
    if (prod.isActive === false) throw new HttpError(400, "Product inactive");

    const lineTotal = it.qty * it.price;
    totalAmount += lineTotal;

    resolvedItems.push({
      productId: prod._id,
      name: prod.name,
      sku: prod.sku,
      qty: it.qty,
      price: it.price,
      lineTotal,
    });

    const after = (prod.stock ?? 0) - it.qty;
    if (after < 0) throw new HttpError(400, "Insufficient stock");
  }

  const doc = await createTransaction({
    storeId: input.storeId,
    invoiceNumber,
    items: resolvedItems,
    totalAmount,
    paymentMethod: input.paymentMethod,
    cashierId: input.cashierId,
  });

  for (const it of input.items) {
    const updated = await adjustStock(it.productId, -it.qty);
    if (!updated) throw new HttpError(404, "Product not found");
  }

  return toDto(doc);
}

export async function listTransactionsTodayService(storeId: string, limit = 100) {
  const rows = await listTransactionsToday(storeId, limit);
  return rows.map(toDto);
}

export async function listTransactionsHistoryService(storeId: string, from: Date, to: Date) {
  const rows = await listTransactionsBetween(storeId, from, to, 200);
  return rows.map(toDto);
}
