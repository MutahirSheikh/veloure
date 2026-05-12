import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">404</p>
      <h1 className="mt-4 font-serif text-5xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">The page you are looking for is not available.</p>
      <Button className="mt-7" asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
