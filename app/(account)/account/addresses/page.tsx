import { AddressBook } from "@/components/forms/address-book";
import { redirectIfNotSignedIn } from "@/lib/auth/guards";
import { getAddresses } from "@/lib/queries/account";

export default async function AccountAddressesPage() {
  const profile = await redirectIfNotSignedIn();
  const addresses = await getAddresses(profile.id);

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Addresses</h1>
      <p className="mt-2 text-muted-foreground">Save delivery details for faster cash-on-delivery checkout.</p>
      <div className="mt-8">
        <AddressBook addresses={addresses} />
      </div>
    </div>
  );
}
