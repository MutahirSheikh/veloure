import Image from "next/image";
import Link from "next/link";
import "@/app/globals.css";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center">
      <Image
        src="/logo/logo-2.png"
        alt="Veloure"
        width={220}
        height={72}
        priority
        className="logo-height-large w-auto object-contain sm:logo-height-medium"
      />
    </Link>
  );
}
