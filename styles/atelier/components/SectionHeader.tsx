interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <header className="mb-12 sm:mb-16 md:mb-20">
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title text-balance">{title}</h2>
      {subtitle ? (
        <p className="section-subtitle mt-4 text-pretty">{subtitle}</p>
      ) : null}
    </header>
  );
}
