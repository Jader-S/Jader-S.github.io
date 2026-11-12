/**
 * GlitchLabel — hover-triggered RGB-split glitch micro-interaction.
 * Spec'd in DESIGN_UI_SPEC.md §2. Renders text with two offset clones
 * (cyan / magenta) that flicker on hover via CSS [data-text] pseudo-elements.
 *
 * Purely decorative; keeps the real text in the DOM for a11y / selection.
 */
import type { CSSProperties, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Text mirrored into ::before/::after clones. Defaults to children when string. */
  text?: string;
  className?: string;
  style?: CSSProperties;
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3';
  /** Always show a subtle idle flicker instead of only on hover. */
  always?: boolean;
}

export default function GlitchLabel({
  children,
  text,
  className = '',
  style,
  as: Tag = 'span',
  always = false,
}: Props) {
  const dataText = text ?? (typeof children === 'string' ? children : undefined);
  return (
    <Tag
      className={`glitch-label ${always ? 'glitch-label--always' : ''} ${className}`.trim()}
      data-text={dataText}
      style={style}
    >
      {children}
    </Tag>
  );
}
