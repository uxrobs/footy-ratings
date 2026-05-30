import { notFound } from "next/navigation";
import { RoundPageContent } from "@/components/RoundPageContent";
import { SetupRequiredPage } from "@/components/SetupRequiredPage";
import { SiteHeader } from "@/components/SiteHeader";
import { getDeviceIdFromCookies } from "@/lib/device";
import { loadRoundPageData } from "@/lib/round-page";
import { isRoundViewable, LAUNCH_ROUND_NUMBER } from "@/lib/rounds";
import { getActiveRound } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase";
import { syncActiveRoundIfStale } from "@/lib/sync";

export const dynamic = "force-dynamic";

interface RoundPageProps {
  params: Promise<{ roundNumber: string }>;
}

export default async function RoundPage({ params }: RoundPageProps) {
  if (!isSupabaseConfigured()) {
    return <SetupRequiredPage />;
  }

  try {
    await syncActiveRoundIfStale();
  } catch (error) {
    console.error("Fixture sync skipped:", error);
  }

  const { roundNumber: roundNumberParam } = await params;
  const roundNumber = Number(roundNumberParam);

  if (!Number.isInteger(roundNumber) || roundNumber < LAUNCH_ROUND_NUMBER) {
    notFound();
  }

  const activeRound = await getActiveRound();
  if (!activeRound || !isRoundViewable(roundNumber, activeRound.round_number)) {
    notFound();
  }

  await getDeviceIdFromCookies();
  const data = await loadRoundPageData(roundNumber);
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <RoundPageContent data={data} />
      </main>
    </>
  );
}
