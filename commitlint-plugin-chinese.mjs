/**
 * 说明以中文为主，允许技术名词中的英文字母与符号（如 Next.js、React、TypeScript）
 */
const SUBJECT_PATTERN =
  /^[\u4e00-\u9fa50-9a-zA-Z.+_\-/，。！？、：；（）【】《》「」『』·—…\s]+$/;

const chineseSubjectRule = (parsed) => {
  const { subject } = parsed;

  if (!subject) {
    return [true];
  }

  const hasChinese = /[\u4e00-\u9fa5]/.test(subject);
  const validFormat = SUBJECT_PATTERN.test(subject);
  const valid = hasChinese && validFormat;

  return [
    valid,
    "提交说明需包含中文，可含技术名词（如 Next.js、React），纯英文说明不被允许",
  ];
};

const chinesePlugin = {
  rules: {
    "chinese-subject": chineseSubjectRule,
  },
};

export default chinesePlugin;
