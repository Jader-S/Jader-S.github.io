interface SectionHeaderProps {
  index: string;
  title: string;
  subtitle: string;
}

export default function SectionHeader({ index, title, subtitle }: SectionHeaderProps) {
  return (
    <header className="mb-8 sm:mb-12 md:mb-16">
      <p className="mb-3 font-mono text-xs tracking-[0.2em] text-theme-light/80">
        {index}
      </p>
      <h2 className="classic-section-title text-balance">{title}</h2>
      <p className="classic-section-subtitle mt-3 max-w-2xl text-pretty">{subtitle}</p>
    </header>
  );
}
