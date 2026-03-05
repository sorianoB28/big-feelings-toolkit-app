export type StudentAvatarOption = {
  key: string;
  label: string;
  imageSrc: string;
};

export type StudentThemeOption = {
  key: "ocean" | "space" | "cozy";
  label: string;
  description: string;
};

export type BadgeTier = "bronze" | "silver" | "gold";

export type BadgeOption = {
  key: string;
  title: string;
  description: string;
  iconKey: string;
  tier: BadgeTier;
};

export const AVATARS = [
  { key: "owl", label: "Owl", imageSrc: "/avatars/owl.svg" },
  { key: "fox", label: "Fox", imageSrc: "/avatars/fox.svg" },
  { key: "otter", label: "Otter", imageSrc: "/avatars/otter.svg" },
  { key: "bear", label: "Bear", imageSrc: "/avatars/bear.svg" },
  { key: "falcon", label: "Falcon", imageSrc: "/avatars/falcon.svg" },
  { key: "panda", label: "Panda", imageSrc: "/avatars/panda.svg" },
  { key: "tiger", label: "Tiger", imageSrc: "/avatars/tiger.svg" },
  { key: "dolphin", label: "Dolphin", imageSrc: "/avatars/dolphin.svg" },
  { key: "wolf", label: "Wolf", imageSrc: "/avatars/wolf.svg" },
  { key: "koala", label: "Koala", imageSrc: "/avatars/koala.svg" },
  { key: "turtle", label: "Turtle", imageSrc: "/avatars/turtle.svg" },
  { key: "rocket", label: "Rocket", imageSrc: "/avatars/rocket.svg" },
] as const satisfies ReadonlyArray<StudentAvatarOption>;

export const THEMES = [
  {
    key: "ocean",
    label: "Ocean",
    description: "Cool blues and soft gradients for a calm focus.",
  },
  {
    key: "space",
    label: "Space",
    description: "Deep tones with subtle glow for a steady reset vibe.",
  },
  {
    key: "cozy",
    label: "Cozy",
    description: "Warm neutrals and gentle contrast for comfort.",
  },
] as const satisfies ReadonlyArray<StudentThemeOption>;

export const BADGES = [
  {
    key: "reset_rookie",
    title: "Reset Rookie",
    description: "Completed your first reset tool.",
    iconKey: "sparkles",
    tier: "bronze",
  },
  {
    key: "steady_starter",
    title: "Steady Starter",
    description: "Completed three tool sessions.",
    iconKey: "target",
    tier: "bronze",
  },
  {
    key: "breathing_builder",
    title: "Breathing Builder",
    description: "Completed three breathing tools.",
    iconKey: "wind",
    tier: "silver",
  },
  {
    key: "grounding_great",
    title: "Grounding Great",
    description: "Completed two grounding sessions.",
    iconKey: "leaf",
    tier: "silver",
  },
  {
    key: "consistency_king",
    title: "Consistency King",
    description: "Completed three check-ins in seven days.",
    iconKey: "flame",
    tier: "gold",
  },
] as const satisfies ReadonlyArray<BadgeOption>;
