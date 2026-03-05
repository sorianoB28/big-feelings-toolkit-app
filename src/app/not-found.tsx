import { Compass } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFoundPage() {
  return (
    <section className="app-container app-page flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="w-full max-w-3xl">
        <EmptyState
          icon={Compass}
          title="We couldn't find that page"
          description="The link may be old or the page may have moved. You can return to the homepage and continue from there."
          actionLabel="Go to Home"
          actionHref="/"
        />
      </div>
    </section>
  );
}
