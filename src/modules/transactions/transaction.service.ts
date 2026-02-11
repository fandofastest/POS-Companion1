import { HttpError } from "@/utils/httpError";
import { findProductByIdAndStore, adjustStock } from "@/modules/products/product.repository";
import {
  createTransaction,
  listTransactionsBetween,
  listTransactionsToday,
} from "@/modules/transactions/transaction.repository";
import type { TransactionDto, TransactionItemDto } from "@/modules/transactions/transaction.dto";
import { generateInvoiceNumber } from "@/modules/counters/invoiceCounter.service";

function roundMoney(n: number) {
  return Math.round(n);
}

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
    subtotal: t.subtotal ?? t.totalAmount,
    discount: t.discount ?? null,
    discountAmount: t.discountAmount ?? 0,
    tax: t.tax ?? null,
    taxAmount: t.taxAmount ?? 0,
    totalAmount: t.totalAmount,
    cashReceived: t.cashReceived ?? null,
    change: t.change ?? 0,
    paymentMethod: t.paymentMethod,
    cashierId: t.cashierId.toString(),
    createdAt: new Date(t.createdAt).toISOString(),
  };
}

export async function createTransactionService(input: {
  storeId: string;
  invoiceNumber?: string;
  paymentMethod: string;
  discount?: { type: "AMOUNT" | "PERCENT"; amount?: number; percent?: number };
  tax?: { rate: number; inclusive?: boolean };
  cashReceived?: number;
  items: { productId: string; qty: number; price: number }[];
  cashierId: string;
}) {
  if (input.items.length === 0) throw new HttpError(422, "No items");

  const invoiceNumber = input.invoiceNumber ?? (await generateInvoiceNumber(input.storeId));

  const resolvedItems: any[] = [];
  let subtotal = 0;

  for (const it of input.items) {
    const prod = await findProductByIdAndStore(it.productId, input.storeId);
    if (!prod) throw new HttpError(404, "Product not found");
    if (prod.isActive === false) throw new HttpError(400, "Product inactive");

    const lineTotal = it.qty * it.price;
    subtotal += lineTotal;

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

  if (!Number.isInteger(subtotal) || subtotal < 0) throw new HttpError(400, "Invalid subtotal");

  let discountAmount = 0;
  let discount: any = null;
  if (input.discount) {
    if (input.discount.type === "AMOUNT") {
      discountAmount = roundMoney(input.discount.amount ?? 0);
      discount = { type: "AMOUNT", amount: discountAmount, percent: null };
    } else {
      const p = input.discount.percent ?? 0;
      discountAmount = roundMoney(subtotal * (p / 100));
      discount = { type: "PERCENT", amount: null, percent: p };
    }
    if (discountAmount < 0) discountAmount = 0;
    if (discountAmount > subtotal) discountAmount = subtotal;
  }

  const discountedSubtotal = subtotal - discountAmount;

  const taxRate = input.tax?.rate ?? 0;
  const taxInclusive = input.tax?.inclusive ?? false;
  let taxAmount = 0;
  let totalAmount = discountedSubtotal;
  let tax: any = null;

  if (taxRate > 0) {
    if (taxInclusive) {
      const net = discountedSubtotal / (1 + taxRate);
      taxAmount = roundMoney(discountedSubtotal - net);
      totalAmount = discountedSubtotal;
    } else {
      taxAmount = roundMoney(discountedSubtotal * taxRate);
      totalAmount = discountedSubtotal + taxAmount;
    }
    tax = { rate: taxRate, inclusive: taxInclusive };
  }

  if (!Number.isInteger(totalAmount) || totalAmount < 0) throw new HttpError(400, "Invalid total");

  const cashReceived = typeof input.cashReceived === "number" ? roundMoney(input.cashReceived) : null;
  if (cashReceived !== null && cashReceived < 0) throw new HttpError(400, "Invalid cashReceived");

  let change = 0;
  if ((input.paymentMethod || "").toUpperCase() === "CASH" && cashReceived !== null) {
    change = Math.max(0, cashReceived - totalAmount);
  }

  const doc = await createTransaction({
    storeId: input.storeId,
    invoiceNumber,
    items: resolvedItems,
    subtotal,
    discount,
    discountAmount,
    tax,
    taxAmount,
    totalAmount,
    cashReceived,
    change,
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
