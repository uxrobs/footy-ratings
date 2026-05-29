import { SiteHeader } from "@/components/SiteHeader";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-10 prose prose-neutral dark:prose-invert">
        <h1>Privacy</h1>
        <p>
          Footy Ratings uses anonymous device identifiers to prevent duplicate votes
          without requiring an account.
        </p>

        <h2>What we store</h2>
        <ul>
          <li>A random device token stored in an httpOnly browser cookie (<code>qw_device</code>)</li>
          <li>A one-way hash of that token in our database</li>
          <li>Your ratings (overall score and optional factor scores)</li>
        </ul>

        <h2>What we do not store</h2>
        <ul>
          <li>Your name, email, or other personal information</li>
          <li>Your raw device token in the database</li>
        </ul>

        <h2>Why we use cookies</h2>
        <p>
          The device cookie lets you update your own ratings while preventing the same
          browser from submitting multiple votes for the same game and phase.
        </p>

        <h2>Contact</h2>
        <p>
          Footy Ratings is an independent fan project and is not affiliated with the AFL.
        </p>
      </main>
    </>
  );
}
