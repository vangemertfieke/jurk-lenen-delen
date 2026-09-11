import { useApp } from "@/lib/store";

/**
 * Beheeraccounts van het Borro-team (Senne & Fieke). In de demo bepaalt het
 * e-mailadres van het ingelogde account of iemand het beheer mag openen.
 * Bij een echte koppeling loopt dit via gebruikersrollen aan de serverkant.
 */
export const ADMIN_EMAILS = ["senne@borro.nl", "fieke@borro.nl"] as const;

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return (ADMIN_EMAILS as readonly string[]).includes(email.trim().toLowerCase());
}

/** True als het ingelogde account bij het Borro-team hoort. */
export function useIsTeamAdmin(): { isAdmin: boolean; hydrated: boolean } {
  const { user, hydrated } = useApp();
  return { isAdmin: isAdminEmail(user?.email), hydrated };
}
