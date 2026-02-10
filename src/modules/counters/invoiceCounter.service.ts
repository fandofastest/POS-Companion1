import { nextInvoiceSequence } from "@/modules/counters/invoiceCounter.repository";

function dateKeyForNow(now: Date) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export async function generateInvoiceNumber(storeId: string, now = new Date()) {
  const dateKey = dateKeyForNow(now);
  const seq = await nextInvoiceSequence(storeId, dateKey);
  const storePart = storeId.slice(-4).toUpperCase();
  const seqPart = String(seq).padStart(4, "0");
  return `INV-${storePart}-${dateKey}-${seqPart}`;
}
