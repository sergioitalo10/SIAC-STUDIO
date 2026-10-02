import type { ReactNode } from "react";

type SiteHeaderProps = {
  children?: ReactNode;
};

export default function SiteHeader({ children }: SiteHeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-black">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a
          href="/"
          className="flex items-center gap-3 transition hover:opacity-90"
        >
          <img
            src="/logo.png"
            alt="SIAC Studio"
            className="h-12 w-auto object-contain"
          />
          <span className="text-2xl font-bold tracking-tight">
            SIAC <span className="text-blue-500">STUDIO</span>
          </span>
        </a>

        {children}
      </div>
    </header>
  );
}
