import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  createDeviceToken,
  DEVICE_COOKIE,
  getDeviceCookieOptions,
} from "@/lib/device-cookie";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const existingDevice = request.cookies.get(DEVICE_COOKIE)?.value;

  if (!existingDevice) {
    response.cookies.set(
      DEVICE_COOKIE,
      createDeviceToken(),
      getDeviceCookieOptions(),
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
