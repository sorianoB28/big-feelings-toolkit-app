import { ToolkitHomepage } from "@/components/toolkit/toolkit-homepage";
import type { ToolCategory } from "@/lib/checkin-options";
import {
  getToolkitFeelingQuickPick,
  TOOLKIT_FEELING_QUICK_PICKS,
} from "@/lib/tools/toolkit-feelings";
import { getToolByKey, getToolsGroupedByCategory } from "@/lib/tools/registry";

type ToolkitPageProps = {
  searchParams?: {
    feeling?: string | string[];
  };
};

const FEATURED_TOOL_CONFIG = [
  { toolKey: "circle_breathing", label: "Circle Breathing" },
  { toolKey: "54321-grounding", label: "Grounding" },
  { toolKey: "shake_out", label: "Shake Out" },
  { toolKey: "ask_for_help", label: "Ask for Help" },
] as const;

const CATEGORY_PREVIEW_DESCRIPTIONS: Record<ToolCategory, string> = {
  calm_body: "Breathing and body tools that help your body slow down and settle.",
  reset_mind: "Grounding and focus tools that help your thoughts reconnect to the present.",
  release_energy: "Safe movement tools for buzzy, wiggly, or full-body energy.",
  get_support: "Friendly scripts and support tools for asking a trusted adult for help.",
};

const CATEGORY_PREVIEW_ORDER: ToolCategory[] = [
  "calm_body",
  "reset_mind",
  "release_energy",
  "get_support",
];

function normalizeFeeling(value: string | string[] | undefined): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue?.trim() ?? null;
}

function getDurationLabel(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} min`;
}

export default function ToolkitPage({ searchParams }: ToolkitPageProps) {
  const selectedFeeling = getToolkitFeelingQuickPick(normalizeFeeling(searchParams?.feeling));
  const groupedTools = getToolsGroupedByCategory("toolkit");

  const featuredTools = FEATURED_TOOL_CONFIG.flatMap((item) => {
    const tool = getToolByKey(item.toolKey);

    if (!tool) {
      return [];
    }

    const categoryLabel = groupedTools.find((group) => group.category === tool.category)?.label ?? "Tool";

    return [
      {
        toolKey: tool.toolKey,
        title: item.label,
        description: tool.description,
        durationLabel: getDurationLabel(tool.durationSeconds),
        categoryLabel,
        href: `/tools/${tool.toolKey}?from=toolkit`,
      },
    ];
  });

  const categoryPreviews = CATEGORY_PREVIEW_ORDER.flatMap((category) => {
    const group = groupedTools.find((item) => item.category === category);

    if (!group) {
      return [];
    }

    return [
      {
        category: group.category,
        label: group.label,
        description: CATEGORY_PREVIEW_DESCRIPTIONS[group.category],
        toolCount: group.tools.length,
        href: `/tools?category=${group.category}#tool-library`,
      },
    ];
  });

  return (
    <ToolkitHomepage
      featuredTools={featuredTools}
      categoryPreviews={categoryPreviews}
      feelingQuickPicks={TOOLKIT_FEELING_QUICK_PICKS}
      selectedFeeling={selectedFeeling}
    />
  );
}
