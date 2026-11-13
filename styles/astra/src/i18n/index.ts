/**
 * i18n minimal. One hook + flat dicts.
 *
 * 语言的唯一真源是根 `I18nProvider`（localStorage: `portfolio-locale`）。
 * 早期这里读 ASTRA 自己的 zustand `prefs.language`，造成双轨：四主题切到英文后，
 * 共享 Demo（SchneiderPOI / EChartMagnifier）与 astra 组件的 useT() 仍输出中文。
 * 现改为订阅根 locale；astra store 的 `prefs.language` 只作为旧持久化字段的镜像保留。
 */
import { useMemo } from "react";
import { useI18n } from "@/components/I18nProvider";
import { zh } from "./zh";
import { en } from "./en";

type AnyFn = (...args: never[]) => unknown;

type DeepString<T> = T extends AnyFn
  ? T
  : T extends readonly (infer U)[]
    ? DeepString<U>[]
    : T extends string
      ? string
      : { [K in keyof T]: DeepString<T[K]> };

export type Dict = DeepString<typeof zh>;

const dictionaries: Record<"zh" | "en", Dict> = { zh, en };

/** ASTRA / 共享 Demo 统一的语言读取口：始终与根 I18nProvider 一致。 */
export function useAstraLocale() {
  return useI18n().locale;
}

export function useT() {
  const lang = useAstraLocale();
  return useMemo(() => dictionaries[lang], [lang]);
}

export type { DeepString };
