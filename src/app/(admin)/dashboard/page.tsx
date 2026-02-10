"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/utils/clientApi";

type TodayDashboard = {
  totalSales: number;
  transactionCount: number;
};

type LowStockRow = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minimumStock: number;
};

type RecentTxRow = {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
};

function formatIdr(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [today, setToday] = useState<TodayDashboard | null>(null);
  const [lowStock, setLowStock] = useState<LowStockRow[]>([]);
  const [recent, setRecent] = useState<RecentTxRow[]>([]);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const [t, l, r] = await Promise.all([
        apiFetch<TodayDashboard>("/api/dashboard/today", { method: "GET" }),
        apiFetch<LowStockRow[]>("/api/dashboard/low-stock", { method: "GET" }),
        apiFetch<RecentTxRow[]>("/api/dashboard/recent-transactions", { method: "GET" }),
      ]);
      setToday(t.data);
      setLowStock(l.data);
      setRecent(r.data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Today overview</p>
        </div>

        <button
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
          onClick={load}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Today Sales</div>
          {loading ? (
            <div className="mt-2 h-7 w-2/3 animate-pulse rounded bg-gray-100" />
          ) : (
            <div className="mt-1 text-2xl font-semibold">{formatIdr(today?.totalSales ?? 0)}</div>
          )}
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Transactions</div>
          {loading ? (
            <div className="mt-2 h-7 w-1/3 animate-pulse rounded bg-gray-100" />
          ) : (
            <div className="mt-1 text-2xl font-semibold">{today?.transactionCount ?? 0}</div>
          )}
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Low Stock</div>
          {loading ? (
            <div className="mt-2 h-7 w-1/3 animate-pulse rounded bg-gray-100" />
          ) : (
            <div className="mt-1 text-2xl font-semibold">{lowStock.length}</div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border">
          <div className="border-b px-4 py-3 text-sm font-semibold">Low Stock</div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            ) : lowStock.length === 0 ? (
              <p className="text-sm text-gray-500">No low stock items</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-500">
                    <tr>
                      <th className="py-2">Item</th>
                      <th className="py-2">SKU</th>
                      <th className="py-2">Stock</th>
                      <th className="py-2">Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2 font-medium">{r.name}</td>
                        <td className="py-2 text-gray-600">{r.sku}</td>
                        <td className="py-2">{r.stock}</td>
                        <td className="py-2">{r.minimumStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3 text-sm font-semibold">Recent Transactions</div>
          <div className="p-4">
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            ) : recent.length === 0 ? (
              <p className="text-sm text-gray-500">No transactions today</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-gray-500">
                    <tr>
                      <th className="py-2">Invoice</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Method</th>
                      <th className="py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2 font-medium">{r.invoiceNumber}</td>
                        <td className="py-2">{formatIdr(r.totalAmount)}</td>
                        <td className="py-2 text-gray-600">{r.paymentMethod}</td>
                        <td className="py-2 text-gray-600">
                          {new Date(r.createdAt).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}
