export const SIGN_IN_ERROR_CODES = [
  "invalid_credentials",
  "domain_not_allowed",
  "inactive_account",
] as const;

export type SignInErrorCode = (typeof SIGN_IN_ERROR_CODES)[number];

function isSignInErrorCode(value: string): value is SignInErrorCode {
  return SIGN_IN_ERROR_CODES.includes(value as SignInErrorCode);
}

export function getSignInErrorMessage(errorCode?: string): string | undefined {
  if (!errorCode) {
    return undefined;
  }

  if (errorCode === "CredentialsSignin" || errorCode === "invalid_credentials") {
    return "We couldn't sign you in with that email and password.";
  }

  if (errorCode === "domain_not_allowed") {
    return "Use an approved school email address to sign in.";
  }

  if (errorCode === "inactive_account") {
    return "Your staff account is inactive. Contact an administrator for help.";
  }

  if (isSignInErrorCode(errorCode)) {
    return "Sign-in failed. Please try again.";
  }

  return "Sign-in is temporarily unavailable. Please try again.";
}
