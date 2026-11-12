# Apply `site-content.yaml` into the portfolio codebase

Read repo-root `site-content.yaml` (create from placeholders if missing).

## Mapping

| YAML                                    | Code targets                                                                |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `site.github`, `site.yearsOfExperience` | `data/profile.ts`                                                           |
| `site.blogProfile`, `blogs`             | `data/blogs.ts`                                                             |
| `skills.categories`                     | `data/skills.ts` + `lib/i18n/locales/{zh,en}.ts` → `skills.categories`      |
| `enterpriseProjects`                    | `data/projects.ts` → `enterpriseProjects` + i18n `enterprise.projects.<id>` |
| `githubProjects`                        | `data/projects.ts` → `githubProjects` + i18n `github.projects.<id>`         |
| `experience`                            | `data/experience.ts` + i18n `experience.domains.<id>`                       |
| `profile`, `hero`, `about`              | `lib/i18n/locales/{zh,en}.ts` corresponding keys                            |

## Rules

1. Keep TypeScript id unions consistent: every `id` in `data/*` must exist in **both** `zh.ts` and `en.ts`.
2. If user only provided Chinese, mirror structure in `en.ts` (translate or temporarily copy zh with an `TODO(en)` comment in the skill reply, not in source).
3. Prefer replacing sample/placeholder entries rather than appending on top of the author's personal content.
4. Do not invent private facts. Use YAML values or explicit placeholders like `你的名字` / `Your Name`.
5. After edits, run `npx tsc --noEmit` (and fix missing i18n keys if reported).

## Preview mode

When `meta.mode: preview` or user skipped filling:

- Keep the YAML placeholders
- Still sync them so the site is about the template person, not Luzhaotian
- Tell the user they can edit `site-content.yaml` later and re-run this mapping
