import { NextResponse } from "next/server";

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function ok<T>(data: T, message = "OK", status = 200) {
  return NextResponse.json<ApiEnvelope<T>>(
    { success: true, message, data },
    { status }
  );
}

export function fail<T>(message: string, status = 400, data?: T) {
  return NextResponse.json<ApiEnvelope<T | null>>(
    { success: false, message, data: (data ?? null) as T | null },
    { status }
  );
}
