import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { act, renderWithProviders, screen } from "@/test/render";
import { useI18n } from "@/components/I18nProvider";
import { useStore } from "@astra/state/useStore";
import { PLANETS } from "@astra/config/site";
import { useT } from "./index";

/** Renders the shared-demo dictionary through the same hook the demos use. */
function LocaleProbe() {
  const t = useT();
  const { locale, setLocale } = useI18n();
  return (
    <div>
      <span data-testid="planet">{t.nav.about}</span>
      <span data-testid="locale">{locale}</span>
      <button type="button" onClick={() => setLocale(locale === "zh" ? "en" : "zh")}>
        toggle
      </button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("astra planet naming", () => {
  const labelOf = (id: string) => PLANETS.find((planet) => planet.id === id)?.label;

  it("uses the agreed 3.2 naming table in both languages", () => {
    expect(labelOf("about")).toEqual({ zh: "关于我", en: "About me" });
    expect(labelOf("projects")).toEqual({ zh: "作品", en: "Projects" });
    expect(labelOf("demos")).toEqual({ zh: "实验室", en: "Forge" });
    expect(labelOf("blog")).toEqual({ zh: "博客", en: "Blog" });
    expect(labelOf("contact")).toEqual({ zh: "联系我", en: "Contact me" });
    expect(labelOf("home")).toEqual({ zh: "全景", en: "Overview" });
  });
});

describe("astra locale bridge", () => {
  it("useT follows the root I18nProvider instead of astra prefs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LocaleProbe />);

    expect(screen.getByTestId("planet")).toHaveTextContent("关于我");
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByTestId("planet")).toHaveTextContent("About me");
    expect(screen.getByTestId("locale")).toHaveTextContent("en");
  });

  it("starts from the persisted main-site locale", () => {
    localStorage.setItem("portfolio-locale", "en");
    renderWithProviders(<LocaleProbe />);
    expect(screen.getByTestId("planet")).toHaveTextContent("About me");
  });

  it("ignores a stale astra:prefs language value", () => {
    localStorage.setItem("portfolio-locale", "en");
    act(() => useStore.getState().setLanguage("zh"));
    renderWithProviders(<LocaleProbe />);
    expect(screen.getByTestId("planet")).toHaveTextContent("About me");
  });
});
