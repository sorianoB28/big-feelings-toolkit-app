import type { ToolCategory } from "@/lib/checkin-options";

export type ToolkitImagePlaceholder = {
  src: string;
  alt: string;
};

export const TOOLKIT_IMAGE_PLACEHOLDERS: {
  hero: ToolkitImagePlaceholder;
  featured: ToolkitImagePlaceholder;
  quickEntry: ToolkitImagePlaceholder;
  libraryHero: ToolkitImagePlaceholder;
  categories: Record<ToolCategory, ToolkitImagePlaceholder>;
} = {
  hero: {
    src: "/images/Toolkit%20Only/heroimage.jpg",
    alt: "A calm classroom reset scene with warm natural light",
  },
  featured: {
    src: "/images/Toolkit%20Only/featuredsceneimage.jpg",
    alt: "A grounded school-day scene that supports the featured Toolkit tools",
  },
  quickEntry: {
    src: "/images/Toolkit%20Only/reflectionsceneimage.jpg",
    alt: "A reflective school setting that supports the Toolkit quick-entry check-in",
  },
  libraryHero: {
    src: "/images/Toolkit%20Only/toolkitlibraryimage.jpg",
    alt: "A calm, organized learning scene introducing the Toolkit Library",
  },
  categories: {
    calm_body: {
      src: "/images/Toolkit%20Only/heroimage.jpg",
      alt: "A calm school-day reset scene for body-settling tools",
    },
    release_energy: {
      src: "/images/Toolkit%20Only/featuredsceneimage.jpg",
      alt: "An active but grounded school scene for movement and release tools",
    },
    reset_mind: {
      src: "/images/Toolkit%20Only/reflectionsceneimage.jpg",
      alt: "A reflective learning scene for focus and grounding tools",
    },
    get_support: {
      src: "/images/Toolkit%20Only/toolkitlibraryimage.jpg",
      alt: "A welcoming school support scene for connection and help-seeking tools",
    },
  },
};
