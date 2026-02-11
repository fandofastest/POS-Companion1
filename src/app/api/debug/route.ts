import type { NextRequest } from "next/server";

import { ok } from "@/utils/apiResponse";
import { withApiError } from "@/utils/routeHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { env } from "@/lib/env";

type ApiRouteDebug = {
  method: string;
  path: string;
  auth?: { required: boolean; roles?: string[] };
  params?: Record<string, string>;
  body?: Record<string, string>;
  notes?: string;
};

export const GET = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const routes: ApiRouteDebug[] = [
    {
      method: "POST",
      path: "/api/auth/register",
      auth: { required: false },
      body: { name: "string", email: "string(email)", password: "string(min 6)" },
    },
    {
      method: "POST",
      path: "/api/auth/login",
      auth: { required: false },
      body: { email: "string(email)", password: "string(min 6)" },
    },
    {
      method: "POST",
      path: "/api/auth/reissue",
      auth: { required: true },
      notes: "Return new tokens with updated storeIds from DB",
    },
    {
      method: "GET",
      path: "/api/auth/me",
      auth: { required: true },
      notes: "Debug token payload: sub, role, storeIds",
    },
    {
      method: "POST",
      path: "/api/stores",
      auth: { required: true, roles: ["OWNER", "ADMIN"] },
      body: { name: "string", address: "string|null", phone: "string|null" },
      notes: "Response includes { store, auth } with new tokens",
    },
    {
      method: "GET",
      path: "/api/stores/my",
      auth: { required: true },
      notes: "Lists stores from token storeIds",
    },
    {
      method: "PATCH",
      path: "/api/stores/:id",
      auth: { required: true, roles: ["OWNER", "ADMIN"] },
      params: { id: "storeId" },
      body: { name: "string?", address: "string|null?", phone: "string|null?", isActive: "boolean?" },
    },
    {
      method: "GET",
      path: "/api/stores/:id/cashiers",
      auth: { required: true, roles: ["OWNER", "ADMIN"] },
      params: { id: "storeId" },
    },
    {
      method: "POST",
      path: "/api/stores/:id/cashiers",
      auth: { required: true, roles: ["OWNER", "ADMIN"] },
      params: { id: "storeId" },
      body: { name: "string", email: "string(email)", password: "string(min 6)" },
    },
    {
      method: "PATCH",
      path: "/api/stores/:id/cashiers/:userId",
      auth: { required: true, roles: ["OWNER", "ADMIN"] },
      params: { id: "storeId", userId: "cashierUserId" },
      body: { isActive: "boolean?", password: "string(min 6)?" },
    },
    {
      method: "POST",
      path: "/api/products",
      auth: { required: true, roles: ["OWNER", "ADMIN"] },
      body: {
        storeId: "string",
        name: "string",
        sku: "string",
        categoryId: "string|null?",
        unit: "string?",
        price: "number>=0",
        stock: "number?",
        minimumStock: "number?",
        primaryImageUrl: "string(url)|null?",
        imageUrls: "string(url)[]?",
      },
    },
    {
      method: "POST",
      path: "/api/products/list",
      auth: { required: true },
      body: { storeId: "string", q: "string?", categoryId: "string?" },
    },
    {
      method: "PATCH",
      path: "/api/products/:id",
      auth: { required: true, roles: ["OWNER", "ADMIN"] },
      params: { id: "productId" },
      notes: "Not yet hardened by storeId in body",
    },
    {
      method: "POST",
      path: "/api/products/:id/stock",
      auth: { required: true, roles: ["OWNER", "ADMIN", "STAFF"] },
      params: { id: "productId" },
      body: { delta: "number" },
      notes: "Not yet hardened by storeId in body",
    },
    {
      method: "POST",
      path: "/api/transactions",
      auth: { required: true, roles: ["OWNER", "ADMIN", "STAFF"] },
      body: {
        storeId: "string",
        invoiceNumber: "string? (optional, server generates if omitted)",
        paymentMethod: "string",
        items: "{productId:string, qty:int>=1, price:number>=0}[]",
      },
    },
    {
      method: "POST",
      path: "/api/transactions/today",
      auth: { required: true },
      body: { storeId: "string", limit: "int 1..500?" },
    },
    {
      method: "POST",
      path: "/api/transactions/history",
      auth: { required: true },
      body: { storeId: "string", from: "string(datetime)?", to: "string(datetime)?" },
    },
    {
      method: "POST",
      path: "/api/dashboard/today",
      auth: { required: true },
      body: { storeId: "string" },
    },
    {
      method: "POST",
      path: "/api/dashboard/low-stock",
      auth: { required: true },
      body: { storeId: "string", limit: "int 1..500?" },
    },
    {
      method: "POST",
      path: "/api/dashboard/recent-transactions",
      auth: { required: true },
      body: { storeId: "string", limit: "int 1..500?" },
    },
    {
      method: "POST",
      path: "/api/uploads",
      auth: { required: true, roles: ["OWNER", "ADMIN"] },
      body: { file: "multipart/form-data" },
      notes: "Uses Cloudinary when CLOUDINARY_* is set; otherwise local /public/uploads",
    },
    {
      method: "GET",
      path: "/api/docs",
      auth: { required: false },
      notes: "Copy-pastable docs (text/plain)",
    },
  ];

  const envPresence = {
    MONGODB_URI: !!env.MONGODB_URI,
    JWT_SECRET: !!env.JWT_SECRET,
    JWT_REFRESH_SECRET: !!env.JWT_REFRESH_SECRET,
    CLOUDINARY_CLOUD_NAME: !!env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!env.CLOUDINARY_API_SECRET,
  };

  return ok({ routes, envPresence }, "OK");
});
