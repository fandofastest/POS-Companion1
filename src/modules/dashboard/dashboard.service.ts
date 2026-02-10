import { listTransactionsToday } from "@/modules/transactions/transaction.repository";
import { listProducts } from "@/modules/products/product.repository";

export async function getTodayDashboardService(storeId: string) {
  const tx = await listTransactionsToday(storeId, 500);
  const totalSales = tx.reduce((sum, t: any) => sum + (t.totalAmount ?? 0), 0);
  return {
    totalSales,
    transactionCount: tx.length,
  };
}

export async function getLowStockService(storeId: string, limit = 20) {
  const products = await listProducts({ storeId });
  const low = products
    .filter((p: any) => (p.isActive ?? true) && (p.stock ?? 0) <= (p.minimumStock ?? 0))
    .slice(0, limit)
    .map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      sku: p.sku,
      stock: p.stock ?? 0,
      minimumStock: p.minimumStock ?? 0,
    }));

  return low;
}

export async function getRecentTransactionsService(storeId: string, limit = 10) {
  const tx = await listTransactionsToday(storeId, limit);
  return tx.map((t: any) => ({
    id: t._id.toString(),
    invoiceNumber: t.invoiceNumber,
    totalAmount: t.totalAmount,
    paymentMethod: t.paymentMethod,
    createdAt: new Date(t.createdAt).toISOString(),
  }));
}
