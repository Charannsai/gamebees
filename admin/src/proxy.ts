import { NextResponse } from "next/server";

export function proxy() {
  return NextResponse.next();
}

export const config = {
  // Do not match any routes - this is a dummy middleware to bypass workspace inference
  matcher: [],
};
