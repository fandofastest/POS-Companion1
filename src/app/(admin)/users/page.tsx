"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiFetch } from "@/utils/clientApi";
import { USER_ROLES } from "@/types/roles";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: (typeof USER_ROLES)[number];
  isActive: boolean;
  storeIds: string[];
};

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(USER_ROLES),
});

type FormValues = z.infer<typeof schema>;

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "STAFF" },
  });

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<UserRow[]>("/api/users", { method: "GET" });
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
    await apiFetch<UserRow>("/api/users", {
      method: "POST",
      body: JSON.stringify(values),
    });
    reset({ name: "", email: "", password: "", role: "STAFF" });
    await load();
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((r) => r.name.toLowerCase().includes(t) || r.email.toLowerCase().includes(t));
  }, [rows, q]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage accounts</p>
        </div>
      </div>

      <div className="mt-4">
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Search name or email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border p-4">
          <div className="text-sm font-semibold">Create User</div>
          <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("name")} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input className="mt-1 w-full rounded-lg border px-3 py-2" {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                type="password"
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Role</label>
              <select className="mt-1 w-full rounded-lg border px-3 py-2" {...register("role")}>
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Create"}
            </button>
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
              ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-500">No users</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-500">
                      <tr>
                        <th className="py-2">Name</th>
                        <th className="py-2">Email</th>
                        <th className="py-2">Role</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="py-2 font-medium">{r.name}</td>
                          <td className="py-2 text-gray-600">{r.email}</td>
                          <td className="py-2">{r.role}</td>
                          <td className="py-2">{r.isActive ? "Active" : "Disabled"}</td>
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
