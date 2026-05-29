import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

async function main() {
  const { syncActiveRoundFixtures } = await import("../src/lib/sync");

  const result = await syncActiveRoundFixtures();
  console.log(result.message);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
