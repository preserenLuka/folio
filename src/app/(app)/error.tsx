"use client";
import { EmptyState } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <EmptyState icon="sparkle" title="Something slipped off the shelf" body="We couldn't load this page. Check your connection and try again." />
      <div className="flex justify-center"><button className="btn btn-primary" onClick={reset}>Try again</button></div>
    </div>
  );
}
