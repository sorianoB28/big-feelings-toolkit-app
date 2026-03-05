import Link from "next/link";
import Image from "next/image";
import type { ClassroomOption, StudentDetail } from "@/db/queries/students";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputBaseClass,
  textareaBaseClass,
} from "@/components/ui/form-styles";
import { AVATARS, THEMES } from "@/lib/student-options";
import { SubmitButton } from "@/components/ui/submit-button";

type StudentFormDefaults = Pick<
  StudentDetail,
  "displayName" | "grade" | "homeroomClassroomId" | "notes" | "avatarKey" | "themeKey" | "active"
>;

type StudentFormProps = {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  cancelHref: string;
  classrooms: ClassroomOption[];
  defaults?: StudentFormDefaults;
  errorMessage?: string;
};

const emptyDefaults: StudentFormDefaults = {
  displayName: "",
  grade: "",
  homeroomClassroomId: "",
  notes: "",
  avatarKey: null,
  themeKey: "ocean",
  active: true,
};

export function StudentForm({
  title,
  description,
  action,
  submitLabel,
  cancelHref,
  classrooms,
  defaults = emptyDefaults,
  errorMessage,
}: StudentFormProps) {
  return (
    <section className="app-card p-6 sm:p-8">
      <h1 className="tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-gray-700">{description}</p>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <form action={action} className="mt-6 space-y-5">
        <div>
          <label htmlFor="display_name" className="mb-1 block text-sm font-medium text-dark">
            Display Name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            maxLength={120}
            defaultValue={defaults.displayName}
            className={inputBaseClass}
          />
        </div>

        <div>
          <label htmlFor="grade" className="mb-1 block text-sm font-medium text-dark">
            Grade
          </label>
          <input
            id="grade"
            name="grade"
            type="text"
            maxLength={20}
            defaultValue={defaults.grade ?? ""}
            className={inputBaseClass}
            placeholder="e.g. 5th"
          />
        </div>

        <div>
          <label
            htmlFor="homeroom_classroom_id"
            className="mb-1 block text-sm font-medium text-dark"
          >
            Homeroom Classroom (Optional)
          </label>
          <select
            id="homeroom_classroom_id"
            name="homeroom_classroom_id"
            defaultValue={defaults.homeroomClassroomId ?? ""}
            className={inputBaseClass}
          >
            <option value="">None</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-dark">
            Staff Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            maxLength={2000}
            defaultValue={defaults.notes ?? ""}
            className={textareaBaseClass}
            placeholder="Private notes visible to staff only"
          />
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-dark">Avatar</legend>
          <p className="mb-3 text-xs text-gray-600">Choose a profile avatar (optional).</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <label className="group relative cursor-pointer rounded-xl border border-border-soft bg-surface p-3 shadow-sm transition-all duration-[250ms] ease-out hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:has-[:checked]:-translate-y-0.5 motion-safe:has-[:checked]:shadow-md has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/25 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/35">
              <input
                type="radio"
                name="avatar_key"
                value=""
                defaultChecked={!defaults.avatarKey}
                className="sr-only"
              />
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                None
              </div>
              <p className="mt-2 text-center text-sm font-medium text-dark">No avatar</p>
            </label>
            {AVATARS.map((avatar) => (
              <label
                key={avatar.key}
                className="group relative cursor-pointer rounded-xl border border-border-soft bg-surface p-3 shadow-sm transition-all duration-[250ms] ease-out hover:border-primary/40 hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:has-[:checked]:-translate-y-0.5 motion-safe:has-[:checked]:shadow-md has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/25 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/35"
              >
                <input
                  type="radio"
                  name="avatar_key"
                  value={avatar.key}
                  defaultChecked={defaults.avatarKey === avatar.key}
                  className="sr-only"
                />
                <div className="mx-auto h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                  <Image
                    src={avatar.imageSrc}
                    alt={avatar.label}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 text-center text-sm font-medium text-dark">{avatar.label}</p>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-dark">Theme</legend>
          <p className="mb-3 text-xs text-gray-600">Set a default style for student-facing screens.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {THEMES.map((theme) => (
              <label
                key={theme.key}
                className="cursor-pointer rounded-xl border border-border-soft bg-surface p-4 shadow-sm transition duration-[250ms] ease-out hover:border-primary/40 hover:shadow-md has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/25"
              >
                <input
                  type="radio"
                  name="theme_key"
                  value={theme.key}
                  defaultChecked={(defaults.themeKey ?? "ocean") === theme.key}
                  className="sr-only"
                />
                <p className="text-sm font-semibold text-dark">{theme.label}</p>
                <p className="mt-1 text-xs text-gray-600">{theme.description}</p>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="inline-flex items-center gap-2 text-sm text-dark">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults.active}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          Active student profile
        </label>

        <div className="flex items-center gap-3">
          <SubmitButton
            label={submitLabel}
            pendingLabel={submitLabel.includes("Create") ? "Creating..." : "Saving..."}
            className={buttonPrimaryClass}
          />
          <Link
            href={cancelHref}
            className={buttonSecondaryClass}
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
