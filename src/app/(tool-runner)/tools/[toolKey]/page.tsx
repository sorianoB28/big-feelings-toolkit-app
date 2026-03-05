import { notFound } from "next/navigation";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { hasToolKey } from "@/lib/tools/registry";

type ToolRunnerPageProps = {
  params: {
    toolKey: string;
  };
  searchParams?: {
    from?: string;
    zone?: string;
    checkinId?: string;
    studentId?: string;
    themeKey?: string;
  };
};

export default function ToolRunnerPage({ params, searchParams }: ToolRunnerPageProps) {
  if (!hasToolKey(params.toolKey)) {
    notFound();
  }

  const from = searchParams?.from ?? null;
  const zone = searchParams?.zone ?? null;
  const checkinId = searchParams?.checkinId?.trim() ?? null;
  const studentId = searchParams?.studentId?.trim() ?? null;
  const themeKey = searchParams?.themeKey?.trim() ?? null;

  return (
    <ToolPageClient
      toolKey={params.toolKey}
      from={from}
      zone={zone}
      checkinId={checkinId}
      studentId={studentId}
      themeKey={themeKey}
    />
  );
}
