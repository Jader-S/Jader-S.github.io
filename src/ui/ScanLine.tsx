/**
 * Slow vertical scan line, opacity 0.06. Hidden when reduced-motion.
 */
import { detectReducedMotion } from '@/utils/device';
import { useEffect, useState } from 'react';

export default function ScanLine() {
  const [active, setActive] = useState(true);

  useEffect(() => {
    setActive(!detectReducedMotion());
  }, []);

  if (!active) return null;
  return <div className="scan-line" aria-hidden="true" />;
}