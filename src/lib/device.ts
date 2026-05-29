import { createHash } from "crypto";
import { cookies } from "next/headers";
import { DEVICE_COOKIE } from "@/lib/device-cookie";

export { DEVICE_COOKIE } from "@/lib/device-cookie";

export function hashDeviceId(deviceId: string): string {
  return createHash("sha256").update(deviceId).digest("hex");
}

export async function getDeviceIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(DEVICE_COOKIE)?.value;
  return value ? hashDeviceId(value) : null;
}
