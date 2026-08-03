"use client";

import { Marquee } from "@/components/ui/marquee";
import { useTranslations } from "next-intl";

const departments = [
  { short: "CS", nameKey: "departmentComputerScience" },
  { short: "BBA", nameKey: "departmentBusiness" },
  { short: "LAW", nameKey: "departmentLaw" },
  { short: "MED", nameKey: "departmentMedicine" },
  { short: "ENG", nameKey: "departmentEngineering" },
  { short: "SCI", nameKey: "departmentScience" },
  { short: "EDU", nameKey: "departmentEducation" },
  { short: "AGRI", nameKey: "departmentAgriculture" },
  { short: "ART", nameKey: "departmentArts" },
  { short: "ECON", nameKey: "departmentEconomics" },
] as const;

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
  const t = useTranslations("Home");
  return (
    <section className="py-10 bg-white dark:bg-gray-950 border-y border-[#E2E8F0] dark:border-gray-800/60 overflow-hidden">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#9CA3AF] mb-6">
        {t("servingFaculties")}
      </p>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10" />
        <Marquee pauseOnHover className="[--duration:35s] [--gap:0.75rem]">
          {departments.map((department) => (
            <DeptLogo
              key={department.short}
              short={department.short}
              name={t(department.nameKey)}
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
