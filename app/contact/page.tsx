"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Headphones,
  GraduationCap,
  Shield,
  Star,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitFeedbackMutation } from "@/store/api/feedbackApi";

/* ── Data ─────────────────────────────────────────────────────────────────── */
const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    lines: ["Norton University Campus", "Phnom Penh, Cambodia"],
    color: "text-[#20659C]",
    bg: "bg-[#20659C]/8 dark:bg-[#20659C]/15",
    glow: "group-hover:shadow-[0_0_30px_rgba(32,101,156,0.15)]",
  },
  {
    icon: Phone,
    title: "Call Us",
    lines: ["+855 81 882 555", "Mon–Sat, 8:00 AM – 8:00 PM", "Sunday, 9:00 AM – 3:00 PM"],
    color: "text-[#DF900A]",
    bg: "bg-[#DF900A]/8 dark:bg-[#DF900A]/15",
    glow: "group-hover:shadow-[0_0_30px_rgba(223,144,10,0.15)]",
  },  
  {
    icon: Mail,
    title: "Email Us",
    lines: ["elibrarynorton@gmail.com", "elibrarynorton@norton.edu.kh"],
    color: "text-[#55B9EA]",
    bg: "bg-[#55B9EA]/10 dark:bg-[#55B9EA]/15",
    glow: "group-hover:shadow-[0_0_30px_rgba(85,185,234,0.15)]",
  },
  {
    icon: Clock,
    title: "Library Hours",
    lines: ["Mon – Sat: 8:00 AM – 8:00 PM", "Sunday: 9:00 AM – 3:00 PM"],
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/15",
    glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  },
];

const quickLinks = [
  { icon: BookOpen, label: "General Inquiry", subject: "General Inquiry", type: "general" as const },
  { icon: Headphones, label: "Technical Support", subject: "Technical Support", type: "bug" as const },
  { icon: GraduationCap, label: "Academic Resources", subject: "Academic Resources", type: "content" as const },
  { icon: Shield, label: "Account Issues", subject: "Account Issues", type: "account" as const },
];

const faqs = [
  {
    q: "How do I get access to the E-Library?",
    a: "All enrolled Norton University students automatically receive access. Simply sign in with your student email and create a password to get started.",
  },
  {
    q: "Can I download books for offline reading?",
    a: "Yes! Most of our digital books support offline reading. Look for the download icon on any book's detail page to save it to your device.",
  },
  {
    q: "How do I report a missing or broken resource?",
    a: "Use the contact form on this page or email support@norton.edu.kh with the book title and a description of the issue. We'll resolve it within 24 hours.",
  },
  {
    q: "Is there a limit on how many books I can borrow?",
    a: "Digital borrowing has no limits — read as many books as you like simultaneously. Physical book loans follow the library's standard policy of 5 books at a time.",
  },
];

/* ── useInView (scroll-triggered) ─────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Floating particles ───────────────────────────────────────────────────── */
function Particles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#20659C]/20 dark:bg-[#55B9EA]/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `hero-float ${4 + Math.random() * 6}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ContactPage() {
  /* ── Form state ── */
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", type: "general" as "general" | "bug" | "feature" | "content" | "account", rating: 0 });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitFeedback] = useSubmitFeedbackMutation();

  /* ── FAQ state ── */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  /* ── Section visibility ── */
  const hero = useInView(0.1);
  const info = useInView(0.1);
  const formSection = useInView(0.1);
  const faqSection = useInView(0.1);
  const ctaSection = useInView(0.1);

  /* ── Submit handler ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await submitFeedback({
        type: form.type,
        subject: form.subject,
        message: form.message,
        name: form.name || undefined,
        email: form.email || undefined,
        rating: form.rating > 0 ? form.rating : undefined,
      }).unwrap();
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setForm({ name: "", email: "", subject: "", message: "", type: "general", rating: 0 });
      }, 4000);
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HERO                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={hero.ref}
        className="relative pt-32 pb-20 overflow-hidden bg-[#F8FAFC] dark:bg-gray-950"
      >
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #20659C 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Particles />

        {/* Top accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#20659C]/8 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div
            className={`transition-all duration-700 ${hero.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#20659C]/10 dark:bg-[#20659C]/20 text-[#20659C] dark:text-[#55B9EA] text-xs font-bold uppercase tracking-wider mb-6 opacity-0 animate-[heroReveal_0.5s_ease_0.1s_forwards]">
              <MessageSquare className="w-3.5 h-3.5" />
              Get in Touch
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A1A1A] dark:text-white leading-tight opacity-0 animate-[heroReveal_0.5s_ease_0.2s_forwards]">
              We&apos;d Love to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#20659C] to-[#55B9EA]">
                Hear From You
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-lg text-[#5E5E5E] dark:text-gray-400 max-w-2xl mx-auto opacity-0 animate-[heroReveal_0.5s_ease_0.35s_forwards]">
              Have a question, feedback, or need help finding a resource?
              Our team is here to support your academic journey.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CONTACT INFO CARDS                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={info.ref}
        className="py-20 bg-white dark:bg-gray-950 relative"
      >
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #20659C 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactInfo.map((item, i) => (
              <div
                key={item.title}
                className={`group relative transition-all duration-700 ${info.inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                  }`}
                style={{ transitionDelay: `${0.1 + 0.1 * i}s` }}
              >
                {/* Hover glow */}
                <div
                  className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 bg-gradient-to-br from-[#20659C]/10 to-[#55B9EA]/10`}
                />

                <div
                  className={`relative p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-[#20659C]/15 dark:group-hover:border-[#55B9EA]/15 ${item.glow}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>

                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white mb-2">
                    {item.title}
                  </h3>
                  {item.lines.map((line) => (
                    <p key={line} className="text-sm text-[#5E5E5E] dark:text-gray-400 leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FORM + MAP                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={formSection.ref}
        className="py-20 bg-[#F8FAFC] dark:bg-gray-900 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #20659C 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* ── Contact Form ── */}
            <div
              className={`transition-all duration-700 ${formSection.inView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
                }`}
            >
              <div className="relative">
                {/* Hover glow */}
                <div className="absolute -inset-px bg-gradient-to-br from-[#20659C]/10 to-[#55B9EA]/10 rounded-2xl opacity-0 hover:opacity-60 blur-sm transition-all duration-500 pointer-events-none" />

                <div className="relative p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#20659C]/8 dark:bg-[#20659C]/15 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-[#20659C]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white">
                        Send a Message
                      </h2>
                      <p className="text-sm text-[#5E5E5E] dark:text-gray-400">
                        We&apos;ll get back to you within 24 hours
                      </p>
                    </div>
                  </div>

                  {sent ? (
                    /* ── Success state ── */
                    <div className="flex flex-col items-center justify-center py-16 text-center opacity-0 animate-[heroReveal_0.5s_ease_forwards]">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-[#5E5E5E] dark:text-gray-400 max-w-sm">
                        Thank you for reaching out. Our team will review your message and respond shortly.
                      </p>
                    </div>
                  ) : (
                    /* ── Form ── */
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Error alert */}
                      {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {error}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-1.5">
                            Full Name <span className="text-xs text-gray-400">(optional)</span>
                          </label>
                          <Input
                            placeholder="Your name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="bg-[#F8FAFC] dark:bg-gray-800/60 border-[#E2E8F0] dark:border-gray-700 focus:border-[#20659C] dark:focus:border-[#55B9EA] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-1.5">
                            Email Address <span className="text-xs text-gray-400">(optional)</span>
                          </label>
                          <Input
                            type="email"
                            placeholder="student@norton.edu.kh"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="bg-[#F8FAFC] dark:bg-gray-800/60 border-[#E2E8F0] dark:border-gray-700 focus:border-[#20659C] dark:focus:border-[#55B9EA] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Feedback type + Subject row */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-1.5">
                            Feedback Type
                          </label>
                          <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                            className="w-full h-9 rounded-lg border bg-[#F8FAFC] dark:bg-gray-800/60 border-[#E2E8F0] dark:border-gray-700 focus:border-[#20659C] dark:focus:border-[#55B9EA] focus:ring-1 focus:ring-[#20659C]/20 dark:focus:ring-[#55B9EA]/20 px-3 text-sm transition-colors outline-none dark:text-white"
                          >
                            <option value="general">General Inquiry</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                            <option value="content">Content Issue</option>
                            <option value="account">Account Help</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-1.5">
                            Subject
                          </label>
                          <Input
                            required
                            placeholder="What's this about?"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            className="bg-[#F8FAFC] dark:bg-gray-800/60 border-[#E2E8F0] dark:border-gray-700 focus:border-[#20659C] dark:focus:border-[#55B9EA] transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-1.5">
                          Message
                        </label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Tell us how we can help..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="w-full rounded-lg border bg-[#F8FAFC] dark:bg-gray-800/60 border-[#E2E8F0] dark:border-gray-700 focus:border-[#20659C] dark:focus:border-[#55B9EA] focus:ring-1 focus:ring-[#20659C]/20 dark:focus:ring-[#55B9EA]/20 px-3 py-2 text-sm transition-colors outline-none resize-none dark:text-white placeholder:text-gray-400"
                        />
                      </div>

                      {/* Star Rating */}
                      <div>
                        <label className="block text-sm font-medium text-[#1A1A1A] dark:text-gray-300 mb-1.5">
                          Rate Your Experience <span className="text-xs text-gray-400">(optional)</span>
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setForm({ ...form, rating: form.rating === star ? 0 : star })}
                              className="p-0.5 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-6 h-6 transition-colors ${
                                  star <= form.rating
                                    ? "fill-[#DF900A] text-[#DF900A]"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            </button>
                          ))}
                          {form.rating > 0 && (
                            <span className="ml-2 text-xs text-[#5E5E5E] dark:text-gray-400">
                              {form.rating}/5
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={sending}
                        className="w-full bg-gradient-to-r from-[#20659C] to-[#1a5287] hover:from-[#1a5287] hover:to-[#154570] text-white shadow-lg shadow-[#20659C]/20 h-11 text-sm font-semibold transition-all duration-300"
                      >
                        {sending ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                            </svg>
                            Sending…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {/* ── Quick Support ── */}
              <div className="mt-6 relative">
                <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60">
                  <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#DF900A]" />
                    Quick Support
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {quickLinks.map((link) => (
                      <button
                        key={link.label}
                        type="button"
                        onClick={() => setForm({ ...form, subject: link.subject, type: link.type })}
                        className="group/link flex items-center gap-2.5 p-3 rounded-xl bg-[#F8FAFC] dark:bg-gray-800/60 border border-transparent hover:border-[#20659C]/20 dark:hover:border-[#55B9EA]/20 transition-all duration-200 text-left"
                      >
                        <link.icon className="w-4 h-4 text-[#20659C] dark:text-[#55B9EA] shrink-0" />
                        <span className="text-sm text-[#5E5E5E] dark:text-gray-400 group-hover/link:text-[#1A1A1A] dark:group-hover/link:text-white transition-colors">
                          {link.label}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 ml-auto text-transparent group-hover/link:text-[#20659C] dark:group-hover/link:text-[#55B9EA] transition-all duration-200 -translate-x-1 group-hover/link:translate-x-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Map ── */}
            <div
              className={`transition-all duration-700 ${formSection.inView
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
                }`}
              style={{ transitionDelay: "0.15s" }}
            >
              <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#E2E8F0]/60 dark:border-gray-800/60">
                {/* Map embed */}
                <iframe
                  title="Norton University Location"
                  src="https://www.google.com/maps?q=11.5881108,104.9301205&z=17&output=embed"
                  className="w-full h-full absolute inset-0"
                  style={{ border: 0, minHeight: "500px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Bottom info bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-[#E2E8F0]/60 dark:border-gray-800/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#20659C]/10 dark:bg-[#20659C]/20 flex items-center justify-center">
                        <MapPin className="w-4.5 h-4.5 text-[#20659C]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white">
                          Norton University
                        </p>
                        <p className="text-xs text-[#5E5E5E] dark:text-gray-400">
                          Phnom Penh, Cambodia
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://maps.app.goo.gl/YRcTRsQC5p2M2WjV7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#20659C] dark:text-[#55B9EA] hover:underline"
                    >
                      Open in Maps
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FAQ                                                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={faqSection.ref}
        className="py-20 bg-white dark:bg-gray-950 relative"
      >
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #20659C 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div
            className={`text-center mb-12 transition-all duration-700 ${faqSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#DF900A]/10 dark:bg-[#DF900A]/20 text-[#DF900A] text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-white">
              Common Questions
            </h2>
            <p className="mt-3 text-[#5E5E5E] dark:text-gray-400 max-w-lg mx-auto">
              Quick answers to the most common questions about our E-Library.
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`transition-all duration-700 ${faqSection.inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                  }`}
                style={{ transitionDelay: `${0.1 + 0.08 * i}s` }}
              >
                <div className="relative group">
                  {/* Hover glow */}
                  <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 bg-gradient-to-br from-[#20659C]/10 to-[#55B9EA]/10" />

                  <div
                    className={`relative rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border transition-all duration-300 ${openFaq === i
                        ? "border-[#20659C]/30 dark:border-[#55B9EA]/30 shadow-md"
                        : "border-[#E2E8F0]/60 dark:border-gray-800/60 group-hover:border-[#20659C]/15 dark:group-hover:border-[#55B9EA]/15"
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left"
                    >
                      <span className="text-sm font-semibold text-[#1A1A1A] dark:text-white pr-4">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-[#20659C] dark:text-[#55B9EA] transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                      <p className="px-5 pb-5 text-sm text-[#5E5E5E] dark:text-gray-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CTA BANNER                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section
        ref={ctaSection.ref}
        className="py-20 bg-[#F8FAFC] dark:bg-gray-900"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`relative overflow-hidden rounded-3xl transition-all duration-700 ${ctaSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#20659C] via-[#1a5287] to-[#154570]" />

            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative px-8 py-14 sm:px-14 sm:py-16 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-5">
                <BookOpen className="w-3.5 h-3.5" />
                Start Exploring
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Ready to Explore the Library?
              </h2>
              <p className="text-white/70 max-w-lg mx-auto mb-8 text-base">
                Browse thousands of academic books, journals, and research papers — all free for Norton University students.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  asChild
                  className="bg-white text-[#20659C] hover:bg-white/90 shadow-xl shadow-black/10 h-11 px-7 font-semibold"
                >
                  <Link href="/books">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Books
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 h-11 px-7 font-semibold"
                >
                  <Link href="/about">
                    Discover Our Platform
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
