import { ProfileForm } from "@/components/forms/profile-form";
import { redirectIfNotSignedIn } from "@/lib/auth/guards";

export default async function AccountProfilePage() {
  const profile = await redirectIfNotSignedIn();

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Profile</h1>
      <p className="mt-2 text-muted-foreground">Keep your customer details up to date.</p>
      <div className="mt-8">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
