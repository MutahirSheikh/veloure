import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-3 text-[2rem] font-black tracking-tight text-[#141414]">
      <Image src="/images/veloure-mark.svg" alt="" width={32} height={32} className="h-8 w-8" />
      <span>{APP_NAME}</span>
    </Link>
  );
}
