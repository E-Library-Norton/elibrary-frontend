import Link from "next/link";
import {
  ExternalLink,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

const INTERNATIONAL_LIBRARIES = [
  { label: "IMF e-Library", href: "https://www.elibrary.imf.org/" },
  { label: "OAPEN Library", href: "https://library.oapen.org/" },
  { label: "CORE Research", href: "https://core.ac.uk/" },
  { label: "Open Library", href: "https://openlibrary.org/" },
  { label: "Project Gutenberg", href: "https://www.gutenberg.org/" },
] as const;

export default function Footer() {
  return (
    <footer className="bg-[#F8FAFC] dark:bg-gray-900 text-[#1A1A1A] dark:text-white border-t border-[#E2E8F0] dark:border-transparent">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.3fr_0.8fr_0.9fr_1.05fr_1.1fr] gap-10 xl:gap-8">
        {/* Brand */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-md">
              <img src="/logo.webp" alt="E-Library Norton" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold">
              E-Library<span className="text-[#DF900A]"> Norton</span>
            </span>
          </Link>
          <p className="text-sm text-[#5E5E5E] dark:text-gray-400 leading-relaxed">
            Norton University's digital library — access thousands of academic
            resources anytime, anywhere.
          </p>
          <div className="flex gap-3">
            {[
              { icon: Facebook, href: "#" },
              { icon: Twitter, href: "#" },
              { icon: Instagram, href: "#" },
              { icon: Youtube, href: "#" },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 rounded-lg bg-[#1A1A1A]/10 dark:bg-white/10 hover:bg-[#20659C] hover:scale-105 flex items-center justify-center transition-all duration-200 group"
              >
                <Icon className="w-4 h-4 text-[#5E5E5E] dark:text-gray-300 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-[#20659C] mb-4 text-sm uppercase tracking-wider">
            Quick Links
          </h3>
          <ul className="space-y-2.5">
            {[
              { href: "/", label: "Home" },
              { href: "/books", label: "Browse Books" },
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-[#5E5E5E] dark:text-gray-400 hover:text-[#20659C] dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-[#20659C] flex-shrink-0" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-[#20659C] mb-4 text-sm uppercase tracking-wider">
            Categories
          </h3>
          <ul className="space-y-2.5">
            {[
              "Computer Science",
              "Engineering",
              "Business",
              "Medicine",
              "Law",
              "Social Science",
            ].map((cat) => (
              <li key={cat}>
                <Link
                  href={`/books?category=${cat}`}
                  className="text-sm text-[#5E5E5E] dark:text-gray-400 hover:text-[#20659C] dark:hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-[#20659C] flex-shrink-0" />
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* International libraries */}
        <div>
          <h3 className="font-semibold text-[#20659C] mb-4 text-sm uppercase tracking-wider">
            International Libraries
          </h3>
          <ul className="space-y-2.5">
            {INTERNATIONAL_LIBRARIES.map((resource) => (
              <li key={resource.href}>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-sm text-[#5E5E5E] transition-colors hover:text-[#20659C] dark:text-gray-400 dark:hover:text-white"
                >
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-[#20659C]" />
                  <span>{resource.label}</span>
                  <ExternalLink className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-[#20659C] mb-4 text-sm uppercase tracking-wider">
            Contact
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-[#5E5E5E] dark:text-gray-400">
              <MapPin className="w-4 h-4 mt-0.5 text-[#20659C] flex-shrink-0" />
              <span>Norton University, Phnom Penh, Cambodia</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-[#5E5E5E] dark:text-gray-400">
              <Phone className="w-4 h-4 text-[#20659C] flex-shrink-0" />
              <span>+855 70 231 331</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-[#5E5E5E] dark:text-gray-400">
              <Mail className="w-4 h-4 text-[#20659C] flex-shrink-0" />
              <span>elibrarynorton@gmail.com
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#E2E8F0] dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-[#9CA3AF] dark:text-gray-500">
            © {new Date().getFullYear()} E-Library Norton. All rights reserved.
          </p>
          <div className="flex gap-4">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm text-[#9CA3AF] dark:text-gray-500 hover:text-[#20659C] dark:hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
