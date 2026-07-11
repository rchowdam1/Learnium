import Link from "next/link";
import { Button } from "@/app/components/ui/Button";

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-primary">
      <h1 className="text-heading text-2xl md:text-3xl">Something went wrong</h1>
      <p className="text-body text-center text-muted">
        An error occurred. Please try again or return home.
      </p>
      <Button href="/" variant="primary">
        Back to home
      </Button>
      <Link
        href="/dashboard"
        className="focus-ring rounded-xl px-2 py-1 text-label text-muted hover:bg-surface hover:text-primary"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
