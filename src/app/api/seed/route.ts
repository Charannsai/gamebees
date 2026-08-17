import { seedDatabase } from "@/app/actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await seedDatabase();
  return NextResponse.json(result);
}
