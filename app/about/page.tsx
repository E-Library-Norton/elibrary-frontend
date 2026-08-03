"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Target,
  Eye,
  Heart,
  Users,
  Award,
  Globe,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Star,
  Mail,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

/* ── Data ── */
const values = [
  {
    icon: BookOpen,
    titleKey: "valueOpenTitle",
    descriptionKey: "valueOpenDescription",
    bg: "bg-[#20659C]",
    glow: "group-hover:shadow-[0_0_30px_rgba(32,101,156,0.3)]",
  },
  {
    icon: Globe,
    titleKey: "valueInnovationTitle",
    descriptionKey: "valueInnovationDescription",
    bg: "bg-[#55B9EA]",
    glow: "group-hover:shadow-[0_0_30px_rgba(85,185,234,0.3)]",
  },
  {
    icon: Users,
    titleKey: "valueCommunityTitle",
    descriptionKey: "valueCommunityDescription",
    bg: "bg-[#DF900A]",
    glow: "group-hover:shadow-[0_0_30px_rgba(223,144,10,0.3)]",
  },
  {
    icon: Award,
    titleKey: "valueExcellenceTitle",
    descriptionKey: "valueExcellenceDescription",
    bg: "bg-emerald-500",
    glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
  },
];

const members = [
  {
    index: "00",
    name: "Hoeurn Chanthorn",
    roleKey: "roleAdvisor",
    photo: "/teams/advisor.jpg",
    bioKey: "advisorBio",
    isLeader: false,
    isAdvisor: true,
  },
  {
    index: "01",
    name: "Chan Samnang",
    roleKey: "roleDeveloper",
    photo: "/teams/samnang.jpg",
    bioKey: "samnangBio",
    isLeader: true,
    isAdvisor: false,
  },
  {
    index: "02",
    name: "Dok Dara",
    roleKey: "roleDeveloper",
    photo: "/teams/dara.jpg",
    bioKey: "daraBio",
    isLeader: false,
    isAdvisor: false,
  },
  {
    index: "03",
    name: "Rorsat Sorphiny",
    roleKey: "roleDeveloper",
    photo: "/teams/sorphiny.jpg",
    bioKey: "sorphinyBio",
    isLeader: false,
    isAdvisor: false,
  },
  {
    index: "04",
    name: "Hoeung Phearun",
    roleKey: "roleDeveloper",
    photo: "/teams/phearun.jpg",
    bioKey: "phearunBio",
    isLeader: false,
    isAdvisor: false,
  },
];

const milestones = [
  { year: "2018", eventKey: "milestone2018", icon: Zap },
  { year: "2020", eventKey: "milestone2020", icon: BookOpen },
  { year: "2022", eventKey: "milestone2022", icon: Users },
  { year: "2023", eventKey: "milestone2023", icon: Sparkles },
  { year: "2024", eventKey: "milestone2024", icon: Star },
];

const techStack = [
  { name: "Next.js",      logo: "/logos/nextjs.svg" },
  { name: "React",        logo: "/logos/react.svg" },
  { name: "TypeScript",   logo: "/logos/typescript.svg" },
  { name: "Express.js",   logo: "/logos/express.svg" },
  { name: "PostgreSQL",   logo: "/logos/postgresql.svg" },
  { name: "Tailwind CSS", logo: "/logos/tailwind.svg" },
  { name: "Docker",       logo: "/logos/docker.svg" },
  { name: "Nginx",        logo: "/logos/nginx.svg" },
  { name: "Redis",        logo: "/logos/redis.svg" },
  { name: "Cloudflare R2",logo: "/logos/cloudflare.svg" },
  { name: "Gemini AI",    logo: "/logos/gemini.png" },
];

function TechCard({ tech }: { tech: { name: string; logo: string } }) {
  return (
    <div className="flex flex-col items-center gap-2.5 min-w-max select-none">
      <div className="w-[72px] h-[72px] rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 grid place-items-center">
        <img
          alt={tech.name}
          src={tech.logo}
          width={44}
          height={44}
          className="w-11 h-11 object-contain"
          draggable={false}
        />
      </div>
      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{tech.name}</p>
    </div>
  );
}

/* ── useInView hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Animated counter ── */
function useCounter(target: number, duration = 2000, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(ease(progress) * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return count;
}

/* ── Floating particles ── */
function Particles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/30"
          style={{
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            animation: `hero-float ${4 + (i % 6)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.4) % 5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Stat item ── */
function StatItem({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCounter(value, 2000, active);
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-extrabold text-white">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-white/60 mt-1">{label}</p>
    </div>
  );
}

/* ── Unified Team Card (advisor + members) ── */
function TeamMemberCard({ member, delay }: { member: typeof members[0]; delay: number }) {
  const t = useTranslations("About");
  const [imgError, setImgError] = useState(false);
  const accent = member.isAdvisor ? "#DF900A" : "#00D0B2";
  const accentAlt = member.isAdvisor ? "#f5b942" : "#00cfff";
  const borderAlpha = member.isAdvisor ? "rgba(223,144,10,0.12)" : "rgba(0,208,178,0.12)";
  const tickAlpha = member.isAdvisor ? "rgba(223,144,10,0.35)" : "rgba(0,208,178,0.35)";
  const viaColor = member.isAdvisor ? "#DF900A" : "#00D0B2";
  const ringGradient = member.isAdvisor
    ? `conic-gradient(from 0deg, #DF900A, #f5b942, transparent, transparent, #DF900A)`
    : `conic-gradient(from 0deg, #00D0B2, #00cfff, transparent, transparent, #00D0B2)`;
  const glowColor = member.isAdvisor ? "rgba(223,144,10,0.20)" : "rgba(0,208,178,0.20)";
  const indexColor = member.isAdvisor ? "rgba(223,144,10,0.5)" : "rgba(0,208,178,0.5)";

  return (
    <div
      className="group relative bg-white/70 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl overflow-hidden text-center flex flex-col opacity-0 hover:-translate-y-1 hover:shadow-xl transition-all duration-500"
      style={{
        animation: `heroReveal 0.6s ease-out ${delay}s forwards`,
        border: `1px solid ${borderAlpha}`,
      }}
    >
      {/* Corner ticks */}
      <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 rounded-tl-sm pointer-events-none" style={{ borderColor: tickAlpha }} />
      <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm pointer-events-none" style={{ borderColor: tickAlpha }} />
      <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 rounded-bl-sm pointer-events-none" style={{ borderColor: tickAlpha }} />
      <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 rounded-br-sm pointer-events-none" style={{ borderColor: tickAlpha }} />

      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60"
        style={{ background: `linear-gradient(to right, transparent, ${viaColor}, transparent)` }}
      />

      {/* Node badge */}
      <div className="absolute top-3 right-4 text-[0.62rem] font-bold tracking-widest" style={{ color: indexColor }}>
        {member.index}
      </div>

      <div className="flex flex-col items-center px-6 pt-8 pb-6 flex-1">
        {/* Photo with spinning ring */}
        <div className="relative mb-5">
          <div
            className="absolute inset-0 rounded-full p-[3px] animate-spin"
            style={{ animationDuration: "6s", background: ringGradient }}
          />
          <div
            className="absolute inset-0 rounded-full blur-md scale-110"
            style={{ background: glowColor }}
          />
          <div
            className="relative w-[160px] h-[160px] rounded-full overflow-hidden border-[3px] border-white dark:border-gray-900"
            style={{ boxShadow: `0 0 0 1px ${borderAlpha}`, background: `${borderAlpha}` }}
          >
            {!imgError ? (
              <img
                src={member.photo}
                alt={member.name}
                width={160}
                height={160}
                className="w-full h-full object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              <span
                className="w-full h-full flex items-center justify-center text-2xl font-bold"
                style={{ color: accent }}
              >
                {member.name.split(" ").map((w: string) => w[0]).join("")}
              </span>
            )}
          </div>
          {/* Status dot */}
          <span className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-gray-900 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </div>

        {/* Name */}
        <h3 className="text-[1.05rem] font-bold text-gray-900 dark:text-white tracking-tight mb-1">
          {member.name}
        </h3>
        {/* Role */}
        <p className="text-[0.72rem] font-semibold tracking-widest uppercase mb-3" style={{ color: accent }}>
          {t(member.roleKey)}
        </p>

        {/* Divider */}
        <div
          className="w-7 h-px mx-auto mb-3 rounded-sm opacity-45"
          style={{ background: `linear-gradient(to right, ${accent}, ${accentAlt})` }}
        />

        {/* Bio */}
        <p className="text-[0.82rem] text-gray-400 dark:text-gray-500 leading-relaxed italic mb-4">
          <span className="not-italic" style={{ color: `${accent}99` }}>&gt; </span>
          {t(member.bioKey)}
          <span className="not-italic" style={{ color: `${accent}99` }}> _</span>
        </p>

        {/* Badge */}
        <div className="mt-auto">
          {member.isAdvisor ? (
            <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase rounded-full px-4 py-1.5 text-[#DF900A] bg-[rgba(223,144,10,0.06)] border border-[rgba(223,144,10,0.2)]">
              {t("projectAdvisor")}
            </span>
          ) : member.isLeader ? (
            <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase rounded-full px-4 py-1.5 text-[#c97000] bg-[rgba(200,120,0,0.06)] border border-[rgba(200,120,0,0.2)]">
              {t("teamLeader")}
            </span>
          ) : (
            <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase rounded-full px-4 py-1.5 text-[#00D0B2] bg-[rgba(0,208,178,0.06)] border border-[rgba(0,208,178,0.18)]">
              {t("member")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ABOUT PAGE
   ═══════════════════════════════════════════════ */
export default function AboutPage() {
  const t = useTranslations("About");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = useInView(0.3);
  const story = useInView();
  const techSection = useInView();
  const valuesSection = useInView();
  const teamSection = useInView();
  const cta = useInView();

  return (
    <>
      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center text-center overflow-hidden bg-white dark:bg-gray-950">

        {/* ── Soft colour blobs (light mode: pastel, dark mode: deeper) ── */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%]  w-[500px] h-[500px] rounded-full bg-[#b2f0e8]/50 dark:bg-[#0d3a61]/40 blur-[120px]" />
          <div className="absolute top-[-5%]  right-[-5%] w-[450px] h-[450px] rounded-full bg-[#c3d9f5]/60 dark:bg-[#1a2d42]/50 blur-[120px]" />
          <div className="absolute bottom-10  left-1/4    w-[400px] h-[400px] rounded-full bg-[#ddd6fe]/40 dark:bg-[#20659C]/20 blur-[100px]" />
          <div className="absolute bottom-0   right-1/4   w-[350px] h-[350px] rounded-full bg-[#fde68a]/20 dark:bg-[#DF900A]/10 blur-[100px]" />
        </div>

        {/* ── Faint dot grid ── */}
        <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)", backgroundSize: "36px 36px" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-28">

          {/* ── Eyebrow label ── */}
          <div
            className="inline-flex items-center gap-3 mb-8 opacity-0"
            style={{ animation: "heroReveal 0.6s ease-out 0.1s forwards" }}
          >
            <div className="h-px w-10 bg-[#20659C]/40" />
            <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#20659C] dark:text-[#55B9EA]">
              {t("university")}
            </span>
            <div className="h-px w-10 bg-[#20659C]/40" />
          </div>

          {/* ── Headline ── */}
          <h1
            className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight mb-7 opacity-0"
            style={{ animation: "heroReveal 0.7s ease-out 0.25s forwards" }}
          >
            <span className="text-gray-900 dark:text-white block">{t("heroMeet")}</span>
            <span className="block text-[#20659C] dark:text-[#55B9EA]">
              {t("heroDigital")}
            </span>
            <span className="block text-gray-400 dark:text-gray-500">
              {t("heroLibrary")}
            </span>
          </h1>

          {/* ── Subtitle ── */}
          <p
            className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed opacity-0"
            style={{ animation: "heroReveal 0.7s ease-out 0.45s forwards" }}
          >
            {t("heroDescription")}
          </p>

          {/* ── CTA buttons ── */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center opacity-0"
            style={{ animation: "heroReveal 0.7s ease-out 0.6s forwards" }}
          >
            <Button
              size="lg"
              asChild
              className="bg-[#20659C] hover:bg-[#1a5287] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] gap-2 font-semibold rounded-xl px-8"
            >
              <Link href="/books">{t("ourLibrary")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 gap-2 rounded-xl px-8 font-semibold"
            >
              <Link href="#team">{t("meetTeam")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS BAR ══════════════ */}
      <section ref={stats.ref} className="bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: 5,     suffix: "",  labelKey: "statsTeamMembers",    color: "text-[#20659C] dark:text-[#55B9EA]" },
            { value: 15000, suffix: "+", labelKey: "statsDigitalBooks",   color: "text-[#20659C] dark:text-[#55B9EA]" },
            { value: 8500,  suffix: "+", labelKey: "statsActiveStudents", color: "text-[#DF900A]" },
            { value: 6,     suffix: "",  labelKey: "statsYearsGrowth",    color: "text-[#20659C] dark:text-[#55B9EA]" },
          ].map((s) => (
            <div key={s.labelKey} className="text-center">
              <p className={`text-4xl font-extrabold ${s.color}`}>
                <span>{stats.inView ? s.value.toLocaleString() : "0"}</span>{s.suffix}
              </p>
              <p className="text-sm text-gray-400 mt-1 font-medium">{t(s.labelKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ OUR STORY ══════════════ */}
      <section ref={story.ref} className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 rounded-full bg-[#20659C]/5 blur-3xl" />
        <div className="absolute bottom-20 left-0 w-72 h-72 rounded-full bg-[#DF900A]/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ${story.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Badge className="mb-4 bg-[#DF900A]/10 text-[#DF900A] border-[#DF900A]/20">{t("journey")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">
              {t("storyTitle")} {" "}
              <span className="bg-gradient-to-r from-[#20659C] to-[#55B9EA] bg-clip-text text-transparent">{t("storyHighlight")}</span>
            </h2>
          </div>

          {/* Two glass cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* How It Started */}
            <div className={`transition-all duration-700 delay-100 ${story.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
              <Card className="h-full bg-gradient-to-br from-[#F0F7FF] to-white dark:from-[#1a2d42] dark:to-gray-800/80 border border-[#20659C]/15 rounded-3xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#20659C] flex items-center justify-center shadow-md">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">{t("howStarted")}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  {t("howStartedDescription")}
                </p>
                <div className="space-y-3">
                  {milestones.map((m, i) => {
                    const MIcon = m.icon;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#20659C] to-[#55B9EA] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          <MIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-[#DF900A] uppercase tracking-wider">{m.year}</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">{t(m.eventKey)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Our Mission */}
            <div className={`transition-all duration-700 delay-200 ${story.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}>
              <Card className="h-full bg-gradient-to-br from-[#20659C] to-[#0d3a61] rounded-3xl p-8 shadow-lg border-0 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-[#55B9EA]/20 blur-[60px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold">{t("mission")}</h3>
                  </div>
                  <p className="text-white/80 leading-relaxed mb-8">
                    {t("missionDescription")}
                  </p>
                  <div className="space-y-3">
                    {[
                      "missionFeatureBooks",
                      "missionFeatureCategories",
                      "missionFeatureAi",
                      "missionFeatureAccess",
                      "missionFeatureFree",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-sm text-white/80 leading-snug">{t(item)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Vision card — full width */}
          <div className={`transition-all duration-700 delay-300 ${story.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <Card className="bg-gradient-to-br from-[#FFF8EC] to-[#FFFDF5] dark:from-[#2a1f0a] dark:to-[#1a150a] border border-[#DF900A]/20 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#DF900A] flex items-center justify-center shadow-md">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">{t("vision")}</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                    {t("visionDescription")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Globe, labelKey: "visionRegional", descKey: "visionRegionalDescription" },
                    { icon: Cpu, labelKey: "visionAi", descKey: "visionAiDescription" },
                    { icon: Heart, labelKey: "visionStudent", descKey: "visionStudentDescription" },
                    { icon: Sparkles, labelKey: "visionEvolving", descKey: "visionEvolvingDescription" },
                  ].map((v) => (
                    <div key={v.labelKey} className="bg-white dark:bg-gray-800/60 rounded-2xl p-4 border border-[#DF900A]/10 shadow-sm">
                      <v.icon className="w-5 h-5 text-[#DF900A] mb-2" />
                      <p className="text-xs font-bold text-[#1A1A1A] dark:text-white mb-0.5">{t(v.labelKey)}</p>
                      <p className="text-[11px] text-gray-400 leading-snug">{t(v.descKey)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ══════════════ CORE VALUES ══════════════ */}
      <section ref={valuesSection.ref} className="py-20 bg-[#F8FAFC] dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#20659C]/5 dark:bg-[#20659C]/10 blur-[100px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${valuesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Badge className="mb-4 bg-[#20659C]/10 text-[#20659C] dark:text-[#55B9EA] border-[#20659C]/20">{t("valuesEyebrow")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">{t("valuesTitle")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={v.titleKey}
                className={`group transition-all duration-700 ${valuesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${(i + 1) * 120}ms` }}
              >
                <Card className={`relative p-6 text-center bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-500 group-hover:-translate-y-2 ${v.glow}`}>
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${v.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <CardContent className="p-0">
                    <div className={`w-14 h-14 rounded-xl ${v.bg} mx-auto mb-4 flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                      <v.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-2">{t(v.titleKey)}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(v.descriptionKey)}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ BUILT WITH MODERN TECH ══════════════ */}
      <section ref={techSection.ref} className="py-20 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className={`text-center transition-all duration-700 ${techSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Badge className="mb-4 bg-[#55B9EA]/10 text-[#20659C] dark:text-[#55B9EA] border-[#55B9EA]/20">{t("stackEyebrow")}</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">{t("stackTitle")}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
              {t("stackDescription")}
            </p>
          </div>
        </div>

        {/* Marquee — dual rows */}
        <div className="relative w-full overflow-hidden space-y-2">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-28 z-10 bg-gradient-to-r from-white dark:from-gray-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-28 z-10 bg-gradient-to-l from-white dark:from-gray-950 to-transparent pointer-events-none" />

          {/* Row 1 — scrolls left */}
          <div className="flex gap-8">
            <div className="flex shrink-0 gap-8 py-6 animate-marquee" style={{ "--duration": "32s", "--gap": "2rem" } as React.CSSProperties}>
              {techStack.map((tech) => (
                <TechCard key={tech.name} tech={tech} />
              ))}
            </div>
            <div className="flex shrink-0 gap-8 py-6 animate-marquee" aria-hidden="true" style={{ "--duration": "32s", "--gap": "2rem" } as React.CSSProperties}>
              {techStack.map((tech) => (
                <TechCard key={tech.name} tech={tech} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ OUR TEAM ══════════════ */}
      <section id="team" ref={teamSection.ref} className="py-20 bg-[#F8FAFC] dark:bg-gray-900 relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className={`mb-10 transition-all duration-700 ${teamSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
              {t("teamTitle")} <em className="text-[#00D0B2] not-italic">{t("teamTitleHighlight")}</em>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              {t("teamDescription")}
            </p>
          </div>

          {/* Advisor — 1 column centered */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-xs">
              <TeamMemberCard member={members[0]} delay={0.1} />
            </div>
          </div>

          {/* Members — 4 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.slice(1).map((m, i) => (
              <TeamMemberCard key={m.name} member={m} delay={0.2 + i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section ref={cta.ref} className="py-24 bg-[#F8FAFC] dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative bg-gradient-to-br from-[#20659C] via-[#1a5287] to-[#0d3a61] rounded-3xl p-12 sm:p-16 text-center text-white overflow-hidden transition-all duration-700 ${cta.inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#55B9EA]/20 blur-[80px]" style={{ animation: "hero-glow 6s ease-in-out infinite" }} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#DF900A]/15 blur-[80px]" style={{ animation: "hero-glow 8s ease-in-out infinite 3s" }} />
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div className="relative z-10">
              <div className={`transition-all duration-700 delay-200 ${cta.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <Sparkles className="w-8 h-8 mx-auto mb-4 text-[#DF900A]" style={{ animation: "hero-spin 4s linear infinite" }} />
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">{t("ctaTitle")}</h2>
                <p className="text-white/70 max-w-lg mx-auto mb-8 text-lg">
                  {t("ctaDescription")}
                </p>
              </div>
              <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-400 ${cta.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <Button size="lg" asChild className="bg-white text-[#20659C] hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.03] gap-2 font-semibold">
                  <Link href="/books">{t("browseLibrary")} <ArrowRight className="w-5 h-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm gap-2">
                  <Link href="/contact"><Mail className="w-4 h-4" /> {t("contactUs")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
