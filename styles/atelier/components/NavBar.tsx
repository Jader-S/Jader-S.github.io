"use client";

import { useEffect, useMemo, useState } from "react";
import LocaleToggle from "@/styles/shared/chrome/LocaleToggle";
import ThemeToggle from "@/styles/shared/chrome/ThemeToggle";
import { useI18n } from "@/components/I18nProvider";
import { useViewport } from "@/lib/hooks/useViewport";
import { lockBodyScroll } from "@/lib/lock-body-scroll";

export default function NavBar() {
  const { t } = useI18n();
  const { isMobile } = useViewport();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");

  const sectionIds = useMemo(() => t.nav.map((link) => link.href.slice(1)), [t.nav]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!menuOpen || !isMobile) return;
    return lockBodyScroll();
  }, [menuOpen, isMobile]);

  const headerBg =
    scrolled || menuOpen
      ? "border-b border-divider bg-[var(--nav-bg)] backdrop-blur-md"
      : "bg-transparent";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300 ${headerBg}`}
    >
      <nav
        className="mx-auto flex max-w-[1080px] items-center justify-between px-4 py-4 sm:px-6 sm:py-5 md:px-8"
        aria-label={t.navAria.main}
      >
        <a
          href="#"
          className="focus-ring rounded-sm font-serif text-base font-medium tracking-tight text-heading transition-colors duration-300 hover:text-theme sm:text-lg"
          onClick={() => setMenuOpen(false)}
          translate="no"
        >
          Jader
        </a>

        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-1">
            {t.nav.map((link) => {
              const id = link.href.slice(1);
              const isActive = activeSection === id;

              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    data-active={isActive ? "true" : "false"}
                    className={`nav-link ${
                      isActive ? "text-theme" : "text-muted hover:text-heading"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <LocaleToggle compact />
          <ThemeToggle compact />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            className="focus-ring flex flex-col gap-1.5 rounded-sm p-2 text-heading"
            aria-label={menuOpen ? t.navAria.closeMenu : t.navAria.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className={`block h-px w-5 bg-current transition-transform ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-current transition-transform ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-b border-divider bg-[var(--nav-bg-solid)] md:hidden">
          <ul className="flex max-h-[calc(100dvh-3.5rem)] flex-col gap-1 overflow-y-auto px-4 py-5">
            {t.nav.map((link) => {
              const id = link.href.slice(1);
              const isActive = activeSection === id;

              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`focus-ring block rounded-sm px-3 py-3 text-base transition-colors ${
                      isActive ? "text-theme" : "text-muted hover:bg-hover"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
            <li className="mt-3 border-t border-divider pt-4">
              <LocaleToggle onSelect={() => setMenuOpen(false)} />
            </li>
            <li className="mt-2 border-t border-divider pt-4">
              <ThemeToggle onSelect={() => setMenuOpen(false)} />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
