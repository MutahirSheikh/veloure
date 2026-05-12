import Image from "next/image";
import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center">
      <Image
        src="/logo/logo 3.png"
        alt="Veloure"
        width={180}
        height={56}
        priority
        className="h-11 w-auto object-contain sm:h-12"
      />
    </Link>
  );
}
