import Image from "next/image";

import { PAGE_BANNER_IMAGE } from "@/lib/constants";

export function PageHero({ title, crumb }: { title: string; crumb?: string }) {
  return (
    <section className="relative isolate h-64 overflow-hidden">
      <Image src={PAGE_BANNER_IMAGE} alt="" fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-black/45" />
      <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
        <h1 className="font-serif text-4xl font-semibold md:text-6xl">{title}</h1>
        {crumb ? <p className="mt-4 text-sm font-medium">Home • {crumb}</p> : null}
      </div>
    </section>
  );
}
