import type { NextRequest } from "next/server";

import { withApiError } from "@/utils/routeHandler";
import { ok } from "@/utils/apiResponse";
import { requireAuth, requireRole } from "@/middleware/auth";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export const POST = withApiError(async (req: NextRequest) => {
  const user = requireAuth(req);
  requireRole(user, ["OWNER", "ADMIN"]);

  const form = await req.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return ok({ url: null }, "No file", 400);
  }

  const anyFile = file as unknown as File;
  const arrayBuffer = await anyFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const hasCloudinary =
    !!env.CLOUDINARY_CLOUD_NAME && !!env.CLOUDINARY_API_KEY && !!env.CLOUDINARY_API_SECRET;

  if (process.env.VERCEL && !hasCloudinary) {
    return ok(
      { url: null },
      "CLOUDINARY_* env vars are required for uploads on Vercel.",
      500
    );
  }

  if (hasCloudinary) {
    const { v2: cloudinary } = await import("cloudinary");

    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });

    const ext = anyFile.name?.includes(".") ? anyFile.name.split(".").pop() : "bin";
    const safeExt = (ext ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");

    const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "pos-companion",
          resource_type: "image",
          format: safeExt || undefined,
        },
        (error: any, result: any) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );

      stream.end(buffer);
    });

    return ok({ url: uploaded.secure_url }, "Uploaded", 201);
  }

  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const crypto = await import("node:crypto");

  const ext = anyFile.name?.includes(".") ? anyFile.name.split(".").pop() : "bin";
  const safeExt = (ext ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${crypto.randomUUID()}.${safeExt || "bin"}`;

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const full = path.join(dir, name);
  await writeFile(full, buffer);

  const url = `/uploads/${name}`;
  return ok({ url }, "Uploaded", 201);
});
