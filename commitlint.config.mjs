import chinesePlugin from "./commitlint-plugin-chinese.mjs";

const config = {
  extends: ["@commitlint/config-conventional"],
  plugins: [chinesePlugin],
  rules: {
    // 仅允许约定前缀
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    // 格式：type: 中文说明（单行，无 scope、无正文）
    "scope-empty": [2, "always"],
    "subject-case": [0],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-min-length": [2, "always", 4],
    "subject-max-length": [2, "always", 72],
    "chinese-subject": [2, "always"],
    "header-max-length": [2, "always", 80],
    // Cursor Agent 会自动附加 Co-authored-by，视为 footer/body，故不强制为空
    "body-empty": [0],
    "footer-empty": [0],
  },
  helpUrl:
    "https://www.conventionalcommits.org/zh-hans/v1.0.0/，格式示例：feat: 添加技能展示区块",
};

export default config;
