import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StyleProvider } from "@/styles/shared/providers/StyleProvider";
import type { StyleMode } from "@/styles/registry";

interface ProvidersProps {
  children: ReactNode;
  style?: StyleMode;
}

function AllProviders({ children, style = "atelier" }: ProvidersProps) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <StyleProvider style={style}>{children}</StyleProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { style?: StyleMode }
) {
  const { style, ...rest } = options ?? {};
  return render(ui, {
    wrapper: ({ children }) => <AllProviders style={style}>{children}</AllProviders>,
    ...rest,
  });
}

export * from "@testing-library/react";
