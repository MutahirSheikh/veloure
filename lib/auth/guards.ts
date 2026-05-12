import "server-only";

import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";

export async function redirectIfNotSignedIn() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/sign-in");
  return profile;
}

export async function redirectIfNotAdmin() {
  const profile = await redirectIfNotSignedIn();
  if (profile.role !== "admin") redirect("/");
  return profile;
}
