import { basePath } from "@/lib/site";
import { DEFAULT_STYLE, STYLE_PATHS, STYLE_STORAGE_KEY, STYLE_IDS } from "@/lib/style";

/** Immediate redirect before React hydrates — prefers last chosen style. */
const redirectScript = `(function(){try{var k=${JSON.stringify(STYLE_STORAGE_KEY)};var base=${JSON.stringify(basePath)};var paths=${JSON.stringify(STYLE_PATHS)};var ids=${JSON.stringify(STYLE_IDS)};var def=${JSON.stringify(DEFAULT_STYLE)};var m=localStorage.getItem(k);var mode=ids.indexOf(m)>=0?m:def;location.replace(base+(paths[mode]||paths[def]))}catch(e){location.replace(${JSON.stringify(`${basePath}${STYLE_PATHS[DEFAULT_STYLE]}`)})}})();`;

/** Redirect `/` to the last style (or default). */
export default function HomeRedirect() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <div
        className="flex min-h-screen items-center justify-center text-sm text-muted"
        aria-live="polite"
      >
        Loading…
      </div>
    </>
  );
}
