import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { UdallerLogo } from "./ui/UdallerLogo";

type SovereignHeaderProps = {
  appName: string;
};

const navLinks = [
  { label: "UDALLER ONE", href: "https://udaller.one" },
  { label: "SCOPE SENTRY", href: "https://scope.udaller.one" },
  { label: "TRUE RATE", href: "https://rate.udaller.one" },
  { label: "LEAD DECAY", href: "https://leads.udaller.one" },
  { label: "TAX SHIELD", href: "https://tools.udaller.one" },
] as const;

export default function SovereignHeader({ appName }: SovereignHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#18181B] border-b border-gray-800 relative z-50" role="banner">
      <div className="py-4 px-6 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center min-w-0">
          <a href="https://udaller.one" className="shrink-0 focus:outline-none rounded">
            <UdallerLogo className="h-8 w-auto shrink-0" />
          </a>
          <span className="text-gray-700 text-xl font-light mx-3 pb-0.5" aria-hidden>|</span>
          <span className="text-[#F4C430] text-lg font-bold tracking-wide truncate">
            {appName}
          </span>
        </div>

        {/* Right: Suite Navigation (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map(({ label, href }) => {
            const isActive = label.toLowerCase() === appName.toLowerCase();
            return (
              <a
                key={label}
                href={href}
                className={`text-sm font-medium tracking-wider uppercase transition-colors ${
                  isActive ? "text-white" : "text-gray-500 hover:text-[#F4C430]"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Right: Mobile Hamburger Toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-[#F4C430] focus:outline-none transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 w-full bg-[#161B22] border-b border-gray-800 shadow-2xl">
          <div className="flex flex-col px-6 py-4 space-y-4">
            {navLinks.map(({ label, href }) => {
              const isActive = label.toLowerCase() === appName.toLowerCase();
              return (
                <a
                  key={label}
                  href={href}
                  className={`text-sm font-medium tracking-wider uppercase transition-colors ${
                    isActive ? "text-white" : "text-gray-500 hover:text-[#F4C430]"
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
