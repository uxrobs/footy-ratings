import { SiteHeader } from "@/components/SiteHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl flex-1 space-y-6 px-4 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Footy Ratings uses anonymous device identifiers to prevent duplicate votes
            without requiring an account.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What we store</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                A random device token stored in an httpOnly browser cookie (
                <code className="rounded bg-muted px-1 py-0.5 text-xs">qw_device</code>)
              </li>
              <li>A one-way hash of that token in our database</li>
              <li>Your ratings (overall score and optional factor scores)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What we do not store</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <ul className="list-disc space-y-2 pl-5">
              <li>Your name, email, or other personal information</li>
              <li>Your raw device token in the database</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why we use cookies</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <p>
              The device cookie lets you update your own ratings while preventing the same
              browser from submitting multiple votes for the same game and phase.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <p>
              Footy Ratings is an independent fan project and is not affiliated with the
              AFL.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
