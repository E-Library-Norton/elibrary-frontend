"use client";

import { Marquee } from "@/components/ui/marquee";

const departments = [
  { short: "CS",   name: "Computer Science" },
  { short: "BBA",  name: "Business Admin" },
  { short: "LAW",  name: "Faculty of Law" },
  { short: "MED",  name: "Medicine" },
  { short: "ENG",  name: "Engineering" },
  { short: "SCI",  name: "Natural Science" },
  { short: "EDU",  name: "Education" },
  { short: "AGRI", name: "Agriculture" },
  { short: "ART",  name: "Fine Arts" },
  { short: "ECON", name: "Economics" },
];

function DeptLogo({ short, name }: { short: string; name: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white dark:bg-gray-900 border border-[#E2E8F0] dark:border-gray-800 shadow-sm shrink-0 select-none">
      <div className="w-7 h-7 rounded-md bg-[#20659C] flex items-center justify-center shrink-0">
        <span className="text-[9px] font-extrabold text-white tracking-tight">{short}</span>
      </div>
      <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white whitespace-nowrap">{name}</span>
    </div>
  );
}

export default function TrustedBySection() {
  return (
    <section className="py-10 bg-white dark:bg-gray-950 border-y border-[#E2E8F0] dark:border-gray-800/60 overflow-hidden">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#9CA3AF] mb-6">
        Serving all faculties at Norton University
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10" />
        <Marquee pauseOnHover className="[--duration:35s] [--gap:0.75rem]">
          {departments.map((d) => (
            <DeptLogo key={d.short} {...d} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
