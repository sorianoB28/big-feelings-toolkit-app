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

export type ToolExperience = "toolkit" | "demo";

export type ToolDefinition = {
  toolKey: string;
  title: string;
  category: ToolCategory;
  description: string;
  durationSeconds: number;
  experiences?: ToolExperience[];
  loadComponent: () => Promise<{ default: ToolComponent }>;
};

export type ToolRegistryItem = ToolDefinition;

export const TOOL_CATEGORY_LABELS: Record<ToolCategory, string> = {
  calm_body: "Calm Body",
  release_energy: "Release Energy",
  reset_mind: "Reset Mind",
  get_support: "Get Support",
};

const DEFAULT_TOOL_EXPERIENCES: readonly ToolExperience[] = ["toolkit", "demo"];

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
    toolKey: "infinity_breathing",
    title: "Infinity Breathing",
    category: "calm_body",
    description: "Follow a smooth infinity loop to pace slow, steady inhales and exhales.",
    durationSeconds: 120,
    experiences: ["toolkit"],
    loadComponent: () => import("@/components/breathing/infinity-breathing"),
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
    toolKey: "stretch-flow",
    title: "Stretch Flow",
    category: "release_energy",
    description: "Move through a short sequence of gentle stretches to loosen tension and restless energy.",
    durationSeconds: 120,
    experiences: ["toolkit"],
    loadComponent: () => import("@/components/tools/stretch-flow"),
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
    toolKey: "color-calm",
    title: "Color Calm",
    category: "reset_mind",
    description: "Tap soft shapes to build a calm color canvas and refocus one choice at a time.",
    durationSeconds: 150,
    experiences: ["toolkit"],
    loadComponent: () => import("@/components/tools/color-calm"),
  },
  {
    toolKey: "ground-and-notice",
    title: "Ground & Notice",
    category: "reset_mind",
    description: "Tap quick sensory prompts to reconnect with what is around you right now.",
    durationSeconds: 120,
    experiences: ["toolkit"],
    loadComponent: () => import("@/components/tools/ground-and-notice"),
  },
  {
    toolKey: "positive-phrase-builder",
    title: "Positive Phrase Builder",
    category: "reset_mind",
    description: "Build one short supportive phrase you can use when things feel hard or shaky.",
    durationSeconds: 90,
    experiences: ["toolkit"],
    loadComponent: () => import("@/components/tools/positive-phrase-builder"),
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

export function isToolAvailableInExperience(
  tool: ToolDefinition,
  experience: ToolExperience
): boolean {
  return (tool.experiences ?? DEFAULT_TOOL_EXPERIENCES).includes(experience);
}

export function getTools(experience?: ToolExperience): ToolDefinition[] {
  if (!experience) {
    return TOOL_REGISTRY;
  }

  return TOOL_REGISTRY.filter((tool) => isToolAvailableInExperience(tool, experience));
}

export function getToolByKey(toolKey: string, experience?: ToolExperience): ToolDefinition | null {
  const tool = TOOLS_BY_KEY.get(toolKey) ?? null;
  if (!tool) {
    return null;
  }

  if (experience && !isToolAvailableInExperience(tool, experience)) {
    return null;
  }

  return tool;
}

export function hasToolKey(toolKey: string, experience?: ToolExperience): boolean {
  return getToolByKey(toolKey, experience) !== null;
}

export function getToolsGroupedByCategory(experience?: ToolExperience): Array<{
  category: ToolCategory;
  label: string;
  tools: ToolDefinition[];
}> {
  const availableTools = getTools(experience);

  return (Object.keys(TOOL_CATEGORY_LABELS) as ToolCategory[]).map((category) => ({
    category,
    label: TOOL_CATEGORY_LABELS[category],
    tools: availableTools.filter((tool) => tool.category === category),
  }));
}

