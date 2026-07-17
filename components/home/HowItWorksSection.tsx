import { Search, BookOpen, Headphones, ArrowRight, Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search & Discover",
    description:
      "Find books, research papers, and resources instantly. Filter by faculty, author, subject, or keyword.",
    color: "text-[#20659C]",
    iconBg: "bg-[#20659C]/10 dark:bg-[#20659C]/20",
    numberColor: "text-[#20659C]",
    borderColor: "hover:border-[#20659C]/40",
    glowColor: "hover:shadow-[0_20px_40px_-15px_rgba(32,101,156,0.25)]",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Read in Browser",
    description:
      "Open any book directly in your browser with our smooth PDF reader. Bookmark, highlight, and take notes — no downloads needed.",
    color: "text-[#DF900A]",
    iconBg: "bg-[#DF900A]/10 dark:bg-[#DF900A]/20",
    numberColor: "text-[#DF900A]",
    borderColor: "hover:border-[#DF900A]/40",
    glowColor: "hover:shadow-[0_20px_40px_-15px_rgba(223,144,10,0.25)]",
  },
  {
    number: "03",
    icon: Headphones,
    title: "Watch, Listen & Download",
    description:
      "Access video lectures, audiobooks, and downloadable PDFs. Learn on any device, anywhere, at your own pace.",
    color: "text-[#55B9EA]",
    iconBg: "bg-[#55B9EA]/10 dark:bg-[#55B9EA]/20",
    numberColor: "text-[#55B9EA]",
    borderColor: "hover:border-[#55B9EA]/40",
    glowColor: "hover:shadow-[0_20px_40px_-15px_rgba(85,185,234,0.25)]",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-10 bg-[#F8FAFC] dark:bg-gray-950 relative overflow-hidden isolate">
      {/* Fallback & Custom CSS Keyframe Injector */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes customReveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal {
          animation: customReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Decorative Aurora Background Blobs */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#20659C]/5 dark:bg-[#20659C]/10 blur-[100px] pointer-events-none -z-10 animate-pulse duration-[8s]" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#DF900A]/5 dark:bg-[#DF900A]/10 blur-[100px] pointer-events-none -z-10 animate-pulse duration-[12s]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-20 opacity-0 animate-reveal [animation-delay:0.1s]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#20659C]/10 dark:bg-[#20659C]/20 text-[#20659C] dark:text-[#55B9EA] text-xs font-bold uppercase tracking-widest mb-5 backdrop-blur-sm border border-[#20659C]/10">
            <Video className="w-3.5 h-3.5" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-5">
            Your library in <span className="text-[#20659C] dark:text-[#55B9EA]">3 simple steps</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Everything you need to succeed academically — free for every Norton
            University student, available instantly on any device.
          </p>
        </div>

        {/* Steps Container */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 relative">
          {/* Desktop Flow Connector Line */}
          <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-[#20659C]/30 via-[#DF900A]/30 to-[#55B9EA]/30 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] -z-10" />

          {steps.map((s, i) => (
            <div
              key={i}
              className={`group relative flex flex-col gap-6 p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/50 backdrop-blur-md transition-all duration-500 ease-out ${s.borderColor} ${s.glowColor} hover:-translate-y-2 opacity-0 animate-reveal`}
              style={{ animationDelay: `${0.25 + 0.15 * i}s` }}
            >
              {/* Step number watermark */}
              <span
                className={`absolute top-4 right-6 text-7xl font-black opacity-[0.04] dark:opacity-[0.06] select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 tracking-tighter ${s.numberColor}`}
              >
                {s.number}
              </span>

              {/* Icon Container */}
              <div
                className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center shrink-0 shadow-sm border border-white/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}
              >
                <s.icon className={`w-7 h-7 ${s.color}`} />
              </div>

              {/* Title & Body Meta */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight group-hover:text-[#20659C] dark:group-hover:text-[#55B9EA] transition-colors duration-300">
                  {s.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                  {s.description}
                </p>
              </div>

              {/* Step Footer Pill */}
              <div
                className={`mt-auto pt-4 inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase ${s.color} opacity-70 group-hover:opacity-100 transition-all duration-300`}
              >
                <span>Step {s.number} of 03</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 transform group-hover:translate-x-1.5" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 opacity-0 animate-reveal [animation-delay:0.75s]">
          <Button
            size="lg"
            asChild
            className="bg-[#20659C] hover:bg-[#164b75] dark:bg-[#20659C] dark:hover:bg-[#2c7cb9] text-white px-8 py-6 rounded-xl gap-3 shadow-xl shadow-[#20659C]/10 hover:shadow-[#20659C]/20 transition-all duration-300 hover:scale-[1.03] text-base font-semibold"
          >
            <Link href="/books">
              Start Exploring <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}