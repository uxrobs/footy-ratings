import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

async function main() {
  const { seedRound } = await import("../src/lib/sync");

  const year = Number(process.env.SEED_YEAR ?? 2026);
  const roundNumber = Number(process.env.SEED_ROUND ?? 12);

  const result = await seedRound(year, roundNumber, true);
  console.log(`Seeded ${result.games} games for ${result.round.name} (${result.round.id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
