"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiFetch } from "@/utils/clientApi";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  unit: string;
  price: number;
  stock: number;
  minimumStock: number;
  primaryImageUrl?: string | null;
  imageUrls?: string[];
  isActive: boolean;
};

const schema = z.object({
  name: z.string().min(2),
  sku: z.string().min(1),
  categoryId: z.string().nullable().optional(),
  unit: z.string().min(1).optional(),
  price: z.number().nonnegative(),
  stock: z.number().optional(),
  minimumStock: z.number().optional(),
  primaryImageUrl: z.string().url().nullable().optional(),
});

const editSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(1),
  categoryId: z.string().nullable().optional(),
  unit: z.string().min(1).optional(),
  price: z.number().nonnegative(),
  minimumStock: z.number().optional(),
  primaryImageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

const stockSchema = z.object({
  delta: z.number(),
});

type FormValues = z.infer<typeof schema>;

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [stocking, setStocking] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingEdit, setUploadingEdit] = useState(false);

  const pageSize = 10;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setEditValue,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: editSubmitting },
  } = useForm<z.infer<typeof editSchema>>({ resolver: zodResolver(editSchema) });

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.set("file", file);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const res = await fetch("/api/uploads", {
      method: "POST",
      body: form,
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    });

    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || !json?.success || !json?.data?.url) {
      throw new Error(json?.message ?? "Upload failed");
    }

    return json.data.url as string;
  };

  const {
    register: registerStock,
    handleSubmit: handleSubmitStock,
    reset: resetStock,
    formState: { errors: stockErrors, isSubmitting: stockSubmitting },
  } = useForm<z.infer<typeof stockSchema>>({ resolver: zodResolver(stockSchema) });

  const load = async (opts?: { q?: string; categoryId?: string }) => {
    setError(null);
    setLoading(true);
    try {
      const qv = opts?.q ?? q;
      const cv = opts?.categoryId ?? categoryFilter;

      const params = new URLSearchParams();
      if (qv.trim()) params.set("q", qv.trim());
      if (cv) params.set("categoryId", cv);

      const [cats, prods] = await Promise.all([
        apiFetch<Category[]>("/api/categories", { method: "GET" }),
        apiFetch<Product[]>(`/api/products?${params.toString()}`, { method: "GET" }),
      ]);
      setCategories(cats.data.filter((c) => c.isActive));
      setRows(prods.data);
      setPage(1);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const payload = {
      ...values,
      categoryId: values.categoryId ? values.categoryId : null,
    };

    await apiFetch<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    reset();
    await load();
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    resetEdit({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId,
      unit: p.unit,
      price: p.price,
      minimumStock: p.minimumStock,
      primaryImageUrl: p.primaryImageUrl ?? null,
      isActive: p.isActive,
    });
  };

  const onSubmitEdit = async (values: z.infer<typeof editSchema>) => {
    if (!editing) return;
    setError(null);

    await apiFetch<Product>(`/api/products/${editing.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...values,
        categoryId: values.categoryId ? values.categoryId : null,
      }),
    });

    setEditing(null);
    resetEdit();
    await load();
  };

  const startStock = (p: Product) => {
    setStocking(p);
    resetStock({ delta: 0 });
  };

  const onSubmitStock = async (values: z.infer<typeof stockSchema>) => {
    if (!stocking) return;
    setError(null);

    await apiFetch<Product>(`/api/products/${stocking.id}/stock`, {
      method: "POST",
      body: JSON.stringify(values),
    });

    setStocking(null);
    resetStock();
    await load();
  };

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Items</h1>
          <p className="mt-1 text-sm text-gray-500">Manage products</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Search name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="w-56 rounded-lg border px-3 py-2 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
          onClick={() => load({ q, categoryId: categoryFilter })}
        >
          Apply
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Add Item</div>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium">Image</label>
              <div className="mt-1 flex items-center gap-3">
                <input
                  className="block w-full text-sm"
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setError(null);
                    setUploading(true);
                    try {
                      const url = await uploadImage(f);
                      setValue("primaryImageUrl", url, { shouldDirty: true, shouldTouch: true });
                    } catch (err: any) {
                      setError(err?.message ?? "Upload failed");
                    } finally {
                      setUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>

            <input type="hidden" {...register("primaryImageUrl")} />
            <div>
              <label className="text-sm font-medium">Name</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("name")} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">SKU</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("sku")} />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select className="mt-1 w-full rounded-lg border px-3 py-2" {...register("categoryId")}> 
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                defaultValue="pcs"
                {...register("unit")}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Stock</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Min Stock</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  type="number"
                  {...register("minimumStock", { valueAsNumber: true })}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border">
            <div className="border-b px-4 py-3 text-sm font-semibold">Items</div>
            <div className="p-4">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                </div>
              ) : rows.length === 0 ? (
                <p className="text-sm text-gray-500">No items</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="py-2">Image</th>
                        <th className="py-2">Name</th>
                        <th className="py-2">SKU</th>
                        <th className="py-2">Price</th>
                        <th className="py-2">Stock</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedRows.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="py-2">
                            {r.primaryImageUrl ? (
                              <img
                                src={r.primaryImageUrl}
                                alt={r.name}
                                className="h-10 w-10 rounded border object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded border bg-gray-50" />
                            )}
                          </td>
                          <td className="py-2 font-medium">{r.name}</td>
                          <td className="py-2 text-gray-600">{r.sku}</td>
                          <td className="py-2">{r.price}</td>
                          <td className="py-2">{r.stock}</td>
                          <td className="py-2 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-100"
                                onClick={() => startStock(r)}
                              >
                                Stock
                              </button>
                              <button
                                className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-100"
                                onClick={() => startEdit(r)}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && rows.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <div className="text-sm text-gray-600">
                    Page {page} / {totalPages}
                  </div>
                  <button
                    className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              )}

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Edit Item</div>
                <div className="text-lg font-semibold">{editing.name}</div>
              </div>
              <button
                className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-100"
                onClick={() => {
                  setEditing(null);
                  resetEdit();
                }}
              >
                Close
              </button>
            </div>

            {editing.primaryImageUrl ? (
              <img
                src={editing.primaryImageUrl}
                alt={editing.name}
                className="mt-3 h-36 w-full rounded-lg border object-cover"
              />
            ) : null}

            <form className="mt-4 grid grid-cols-1 gap-3" onSubmit={handleSubmitEdit(onSubmitEdit)}>
              <div>
                <label className="text-sm font-medium">Image</label>
                <input
                  className="mt-1 block w-full text-sm"
                  type="file"
                  accept="image/*"
                  disabled={uploadingEdit}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setError(null);
                    setUploadingEdit(true);
                    try {
                      const url = await uploadImage(f);
                      setEditing({ ...editing, primaryImageUrl: url });
                      setEditValue("primaryImageUrl", url, { shouldDirty: true, shouldTouch: true });
                    } catch (err: any) {
                      setError(err?.message ?? "Upload failed");
                    } finally {
                      setUploadingEdit(false);
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              <input type="hidden" {...registerEdit("primaryImageUrl")} />
              <div>
                <label className="text-sm font-medium">Name</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2" {...registerEdit("name")} />
                {editErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{editErrors.name.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2" {...registerEdit("sku")} />
                {editErrors.sku && <p className="mt-1 text-sm text-red-600">{editErrors.sku.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2" {...registerEdit("categoryId")}>
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2" {...registerEdit("unit")} />
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    type="number"
                    step="0.01"
                    {...registerEdit("price", { valueAsNumber: true })}
                  />
                  {editErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{editErrors.price.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Min Stock</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    type="number"
                    {...registerEdit("minimumStock", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Active</label>
                  <select
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    {...registerEdit("isActive", {
                      setValueAs: (v) => (v === "true" ? true : v === "false" ? false : v),
                    })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={editSubmitting}
                className="mt-2 w-full rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                {editSubmitting ? "Updating..." : "Update"}
              </button>
            </form>
          </div>
        </div>
      )}

      {stocking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">Stock Adjustment</div>
                <div className="text-lg font-semibold">{stocking.name}</div>
                <div className="mt-1 text-sm text-gray-600">Current: {stocking.stock}</div>
              </div>
              <button
                className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-100"
                onClick={() => {
                  setStocking(null);
                  resetStock();
                }}
              >
                Close
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleSubmitStock(onSubmitStock)}>
              <div>
                <label className="text-sm font-medium">Delta (+/-)</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  type="number"
                  {...registerStock("delta", { valueAsNumber: true })}
                />
                {stockErrors.delta && (
                  <p className="mt-1 text-sm text-red-600">{stockErrors.delta.message}</p>
                )}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={stockSubmitting}
                className="w-full rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                {stockSubmitting ? "Updating..." : "Update Stock"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
