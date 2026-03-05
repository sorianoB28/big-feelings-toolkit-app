import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { buttonPrimaryClass } from "@/components/ui/form-styles";

type NotAuthorizedProps = {
  message?: string;
};

export function NotAuthorized({ message }: NotAuthorizedProps) {
  return (
    <section className="app-container app-page">
      <GlassCard variant="soft" accent className="mx-auto w-full max-w-3xl p-8 text-center sm:p-10">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 tracking-tight">Access restricted</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-700">
          {message ?? "This page is limited to staff with specific permissions. If you expected access, ask an administrator for help."}
        </p>
        <div className="mt-6">
          <Link href="/dashboard" className={buttonPrimaryClass}>
            Return to Dashboard
          </Link>
        </div>
      </GlassCard>
    </section>
  );
}
