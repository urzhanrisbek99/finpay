// Conventional Commits: type(scope): subject.
// Пакеты commitlint стояли в devDependencies, но без конфига и без хука
// commit-msg не проверяли ничего — правило существовало только на словах
// в README.
const config = {
  extends: ["@commitlint/config-conventional"],
};

export default config;
