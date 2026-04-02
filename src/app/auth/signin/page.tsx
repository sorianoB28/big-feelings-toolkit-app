import { redirect } from "next/navigation";
import { getSafeCallbackUrl } from "@/lib/auth/redirects";

type SignInPageProps = {
  searchParams?: {
    callbackUrl?: string;
    error?: string;
  };
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = new URLSearchParams();

  if (typeof searchParams?.callbackUrl === "string" && searchParams.callbackUrl.length > 0) {
    params.set("callbackUrl", getSafeCallbackUrl(searchParams.callbackUrl));
  }

  if (typeof searchParams?.error === "string" && searchParams.error.length > 0) {
    params.set("error", searchParams.error);
  }

  redirect(params.size > 0 ? `/auth?${params.toString()}` : "/auth");
}
