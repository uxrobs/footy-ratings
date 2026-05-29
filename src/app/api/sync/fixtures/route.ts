import { NextRequest, NextResponse } from "next/server";
import { syncActiveRoundFixtures } from "@/lib/sync";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Fixtures sync automatically on page visits. This endpoint is optional (manual runs).
  if (!cronSecret) {
    return NextResponse.json(
      {
        error:
          "Manual sync disabled. Fixtures update automatically when users visit the site.",
      },
      { status: 403 },
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const result = await syncActiveRoundFixtures();
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/sync/fixtures", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
