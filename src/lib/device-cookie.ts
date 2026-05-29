export const DEVICE_COOKIE = "qw_device";

export function createDeviceToken(): string {
  return crypto.randomUUID();
}

export function getDeviceCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 365) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
