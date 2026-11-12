/**
 * i18n minimal. One hook + flat dicts.
 */
import { useMemo } from 'react';
import { useStore } from '@/state/useStore';
import { zh } from './zh';
import { en } from './en';

type DeepString<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly (infer U)[]
    ? DeepString<U>[]
    : T extends string
      ? string
      : { [K in keyof T]: DeepString<T[K]> };

export type Dict = DeepString<typeof zh>;

const dictionaries: Record<'zh' | 'en', Dict> = { zh, en };

export function useT() {
  const lang = useStore((s) => s.prefs.language);
  return useMemo(() => dictionaries[lang], [lang]);
}

export type { DeepString };