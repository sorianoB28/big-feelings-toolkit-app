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
  { key: "cat", label: "Cat", imageSrc: "/avatars/cat.png" },
  { key: "dog", label: "Dog", imageSrc: "/avatars/dog.png" },
  { key: "duck", label: "Duck", imageSrc: "/avatars/duck.png" },
  { key: "eagle", label: "Eagle", imageSrc: "/avatars/eagle.png" },
  { key: "lion", label: "Lion", imageSrc: "/avatars/lion.png" },
  { key: "monkey", label: "Monkey", imageSrc: "/avatars/monkey.png" },
  { key: "owl", label: "Owl", imageSrc: "/avatars/owl.png" },
  { key: "panda", label: "Panda", imageSrc: "/avatars/panda.png" },
  { key: "penguin", label: "Penguin", imageSrc: "/avatars/penguin.png" },
  { key: "rabbit", label: "Rabbit", imageSrc: "/avatars/rabbit.png" },
  { key: "sloth", label: "Sloth", imageSrc: "/avatars/sloth.png" },
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
