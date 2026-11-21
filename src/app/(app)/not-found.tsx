import { EmptyState } from "@/components/ui";
export default function NotFound() {
  return <EmptyState icon="search" title="Nothing here" body="That book or page doesn't exist, or it isn't on your shelf." href="/books" cta="Back to your books" />;
}
