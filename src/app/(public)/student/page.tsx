import { StudentHome } from "@/components/student/student-home";
import { AVATARS, THEMES } from "@/lib/student-options";

type StudentHomePageProps = {
  searchParams?: {
    name?: string;
    avatar?: string;
    theme?: string;
    points?: string;
    studentId?: string;
  };
};

function parseName(value: string | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized.slice(0, 80) : "Student";
}

function parseAvatar(value: string | undefined): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return null;
  }

  return AVATARS.some((avatar) => avatar.key === normalized) ? normalized : null;
}

function parseTheme(value: string | undefined): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return "ocean";
  }

  return THEMES.some((theme) => theme.key === normalized) ? normalized : "ocean";
}

function parsePoints(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

function parseStudentId(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

export default function StudentHomePage({ searchParams }: StudentHomePageProps) {
  return (
    <StudentHome
      studentName={parseName(searchParams?.name)}
      avatarKey={parseAvatar(searchParams?.avatar)}
      themeKey={parseTheme(searchParams?.theme)}
      points={parsePoints(searchParams?.points)}
      studentId={parseStudentId(searchParams?.studentId)}
    />
  );
}

