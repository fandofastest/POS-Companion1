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

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});

type FormValues = z.infer<typeof schema>;

export default function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<Category[]>("/api/categories", { method: "GET" });
      setRows(res.data);
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
    if (editingId) {
      await apiFetch<Category>(`/api/categories/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
    } else {
      await apiFetch<Category>("/api/categories", {
        method: "POST",
        body: JSON.stringify(values),
      });
    }
    reset();
    setEditingId(null);
    await load();
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    reset({ name: c.name, slug: c.slug });
  };

  const toggleActive = async (c: Category) => {
    setError(null);
    await apiFetch<Category>(`/api/categories/${c.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    await load();
  };

  const activeCount = useMemo(() => rows.filter((r) => r.isActive).length, [rows]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">{activeCount} active</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">{editingId ? "Edit Category" : "Create Category"}</div>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("name")} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("slug")} />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : editingId ? "Update" : "Save"}
            </button>

            {editingId && (
              <button
                type="button"
                className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  reset();
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border">
            <div className="border-b px-4 py-3 text-sm font-semibold">List</div>
            <div className="p-4">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
                </div>
              ) : rows.length === 0 ? (
                <p className="text-sm text-gray-500">No categories</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="py-2">Name</th>
                        <th className="py-2">Slug</th>
                        <th className="py-2">Active</th>
                        <th className="py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="py-2 font-medium">{r.name}</td>
                          <td className="py-2 text-gray-600">{r.slug}</td>
                          <td className="py-2">
                            <button
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-100"
                              onClick={() => toggleActive(r)}
                            >
                              {r.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="py-2 text-right">
                            <button
                              className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-100"
                              onClick={() => startEdit(r)}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
