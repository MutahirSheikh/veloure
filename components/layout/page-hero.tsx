import Image from "next/image";
import Link from "next/link";

import { PAGE_BANNER_IMAGE } from "@/lib/constants";

export function PageHero({ title, crumb }: { title: string; crumb?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-black/8 bg-[#b68d62]">
      <div className="absolute inset-y-0 right-0 hidden w-[38%] lg:block">
        <Image src={PAGE_BANNER_IMAGE} alt="" fill priority className="object-cover object-center" sizes="40vw" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(182,141,98,0.96)_0%,rgba(182,141,98,0.94)_58%,rgba(182,141,98,0.2)_100%)]" />
      <div className="container relative z-10 flex min-h-[240px] flex-col items-center justify-center py-16 text-center text-white md:min-h-[280px]">
        <h1 className="text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
        {crumb ? (
          <div className="mt-5 flex items-center gap-3 text-sm font-medium text-white/90">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>›</span>
            <span>{crumb}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
