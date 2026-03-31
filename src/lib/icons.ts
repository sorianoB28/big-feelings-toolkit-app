import {
  BookOpen,
  Brain,
  CircleDot,
  ClipboardCheck,
  Eye,
  Flower2,
  Gauge,
  GraduationCap,
  Hand,
  HeartHandshake,
  LifeBuoy,
  MessageSquareHeart,
  Palette,
  PersonStanding,
  ShieldUser,
  Sparkles,
  Square,
  SquareUserRound,
  Users,
  Waves,
  Wind,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ToolCategory } from "@/lib/checkin-options";

export const navIcons = {
  dashboard: Gauge,
  students: Users,
  tools: Wrench,
  resources: BookOpen,
  staff: GraduationCap,
  profile: SquareUserRound,
} as const satisfies Record<string, LucideIcon>;

export const toolCategoryIcons: Record<ToolCategory, LucideIcon> = {
  calm_body: Wind,
  release_energy: Hand,
  reset_mind: Brain,
  get_support: LifeBuoy,
};

export const toolIcons = {
  box_breathing: Square,
  circle_breathing: CircleDot,
  infinity_breathing: Wind,
  star_breathing: Sparkles,
  "bubble-breathing": Waves,
  bubble_breathing: Waves,
  "wall-push": Hand,
  wall_push: Hand,
  "54321-grounding": Flower2,
  "ground-and-notice": Eye,
  ground_and_notice: Eye,
  "color-calm": Palette,
  color_calm: Palette,
  "positive-phrase-builder": MessageSquareHeart,
  positive_phrase_builder: MessageSquareHeart,
  grounding: Flower2,
  body_map: Brain,
  "body-map": Brain,
  shake_out: Hand,
  "shake-out": Hand,
  "stretch-flow": PersonStanding,
  stretch_flow: PersonStanding,
  ask_for_help: MessageSquareHeart,
  "ask-for-help": MessageSquareHeart,
  "talk-to-teacher": MessageSquareHeart,
  talk_to_teacher: MessageSquareHeart,
  default: Sparkles,
} as const satisfies Record<string, LucideIcon>;

export const dashboardStatIcons = {
  students: Users,
  active_checkins: ClipboardCheck,
  tools_used_today: HeartHandshake,
  staff_members: ShieldUser,
} as const satisfies Record<string, LucideIcon>;
