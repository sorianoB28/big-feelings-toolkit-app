import type { ComponentType } from "react";
import type { ToolCategory } from "@/lib/checkin-options";

export type ToolRuntimeProps = {
  isRunning: boolean;
  isFinished: boolean;
  elapsedSeconds: number;
  remainingSeconds: number;
  durationSeconds: number;
  progressPercent: number;
  onFinish: () => void;
  onStatusChange?: (status: ToolRuntimeStatus | null) => void;
};

export type ToolRuntimeStatus = {
  phaseLabel?: string;
  cycleLabel?: string;
  cycleProgressPercent?: number;
};

export type ToolComponent = ComponentType<ToolRuntimeProps>;

export type ToolDefinition = {
  toolKey: string;
  title: string;
  category: ToolCategory;
  description: string;
  durationSeconds: number;
  loadComponent: () => Promise<{ default: ToolComponent }>;
};

export type ToolRegistryItem = ToolDefinition;

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  calm_body: "Calm Body",
  release_energy: "Release Energy",
  reset_mind: "Reset Mind",
  get_support: "Get Support",
};

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    toolKey: "box_breathing",
    title: "Box Breathing",
    category: "calm_body",
    description: "Breathe in, hold, breathe out, hold - each for 4 seconds.",
    durationSeconds: 120,
    loadComponent: () => import("@/components/tools/box-breathing"),
  },
  {
    toolKey: "circle_breathing",
    title: "Circle Breathing",
    category: "calm_body",
    description: "Breathe in as the circle grows, hold, then breathe out as it shrinks.",
    durationSeconds: 120,
    loadComponent: () => import("@/components/tools/circle-breathing"),
  },
  {
    toolKey: "star_breathing",
    title: "Star Breathing",
    category: "calm_body",
    description: "Trace the star slowly. Breathe in along one edge, breathe out along the next.",
    durationSeconds: 120,
    loadComponent: () => import("@/components/tools/star-breathing"),
  },
  {
    toolKey: "bubble-breathing",
    title: "Bubble Breathing",
    category: "calm_body",
    description: "Follow a guided inhale-hold-exhale rhythm to lower body tension.",
    durationSeconds: 120,
    loadComponent: () => import("@/components/tools/exercises/bubble-breathing-tool"),
  },
  {
    toolKey: "wall-push",
    title: "Wall Push",
    category: "release_energy",
    description: "Use short push-and-release rounds to move strong energy out safely.",
    durationSeconds: 90,
    loadComponent: () => import("@/components/tools/exercises/wall-push-tool"),
  },
  {
    toolKey: "shake_out",
    title: "Shake Out",
    category: "release_energy",
    description: "Shake your hands/arms/legs for a short countdown, then pause.",
    durationSeconds: 60,
    loadComponent: () => import("@/components/tools/shake-out"),
  },
  {
    toolKey: "54321-grounding",
    title: "5-4-3-2-1 Grounding",
    category: "reset_mind",
    description: "Name what you sense to bring attention back to the present moment.",
    durationSeconds: 180,
    loadComponent: () => import("@/components/tools/exercises/grounding-54321-tool"),
  },
  {
    toolKey: "body_map",
    title: "Body Map Check-In",
    category: "reset_mind",
    description: "Tap where you feel it in your body.",
    durationSeconds: 90,
    loadComponent: () => import("@/components/tools/body-map"),
  },
  {
    toolKey: "talk-to-teacher",
    title: "Talk to Teacher Script",
    category: "get_support",
    description: "Build a clear support request you can use with a trusted adult.",
    durationSeconds: 120,
    loadComponent: () => import("@/components/tools/exercises/talk-to-teacher-tool"),
  },
  {
    toolKey: "ask_for_help",
    title: "Ask for Help",
    category: "get_support",
    description: "Practice a short, clear way to ask for support.",
    durationSeconds: 90,
    loadComponent: () => import("@/components/tools/exercises/ask-for-help-tool"),
  },
];

const TOOLS_BY_KEY = new Map<string, ToolDefinition>(
  TOOL_REGISTRY.map((tool) => [tool.toolKey, tool])
);

export function getToolByKey(toolKey: string): ToolDefinition | null {
  return TOOLS_BY_KEY.get(toolKey) ?? null;
}

export function hasToolKey(toolKey: string): boolean {
  return TOOLS_BY_KEY.has(toolKey);
}

export function getToolsGroupedByCategory(): Array<{
  category: ToolCategory;
  label: string;
  tools: ToolDefinition[];
}> {
  return (Object.keys(TOOL_CATEGORY_LABELS) as ToolCategory[]).map((category) => ({
    category,
    label: TOOL_CATEGORY_LABELS[category],
    tools: TOOL_REGISTRY.filter((tool) => tool.category === category),
  }));
}

