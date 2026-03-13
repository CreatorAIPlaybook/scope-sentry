import { UdallerLogo } from "@/components/ui/UdallerLogo";

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
  return (
    <header
      className="bg-[#18181B] border-b border-gray-800 py-4 px-6"
      role="banner"
    >
      <nav
        className="flex items-center justify-between gap-4"
        aria-label="Main navigation"
      >
        {/* Left: Brand Identity */}
        <div className="flex items-center min-w-0">
          <a
            href="https://udaller.one"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 focus:outline-none rounded"
          >
            <UdallerLogo className="h-8 w-auto" />
          </a>
          <span className="text-gray-700 text-xl font-light mx-3 pb-0.5" aria-hidden>
            |
          </span>
          <span className="text-[#F4C430] text-lg font-bold tracking-wide truncate">
            {appName}
          </span>
        </div>

        {/* Right: Suite Navigation (desktop) */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium tracking-wider uppercase">
          {navLinks.map(({ label, href }) => {
            const isActive =
              label.toLowerCase() === appName.toLowerCase();
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  isActive
                    ? "text-white"
                    : "text-gray-500 hover:text-[#F4C430] transition-colors"
                }
              >
                {label}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
