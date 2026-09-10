import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const CHECKS = [
  ["lint", "ESLint"],
  ["lint:fsd", "FSD boundaries"],
  ["format:check", "Prettier"],
  ["typecheck", "TypeScript"],
  ["test", "Tests"],
];

const isWindows = process.platform === "win32";
const skipChecks = process.argv
  .slice(2)
  .some((a) => a === "--skip-checks" || a === "-s");

const paint = (code) => (s) =>
  process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s;
const dim = paint(2);
const bold = paint(1);
const green = paint(32);
const red = paint(31);
const yellow = paint(33);

function git(args) {
  return spawnSync("git", args, { encoding: "utf8" });
}

function gitLines(args) {
  return (git(args).stdout ?? "").split("\n").filter(Boolean);
}

function list(files, limit = 10) {
  files.slice(0, limit).forEach((f) => console.log(dim(`  ${f}`)));
  if (files.length > limit) {
    console.log(dim(`  … and ${files.length - limit} more`));
  }
}

function runScript(script) {
  return spawnSync("npm", ["run", "--silent", script], {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    shell: isWindows,
  });
}

function commitizenEntry() {
  const entry = join(
    process.cwd(),
    "node_modules",
    "commitizen",
    "bin",
    "git-cz.js",
  );
  if (!existsSync(entry)) {
    console.error(red("commitizen is not installed — run npm install.\n"));
    process.exit(1);
  }
  return entry;
}

if (git(["diff", "--cached", "--quiet"]).status !== 1) {
  console.error(`\n${red("Nothing staged.")}`);
  const waiting = [
    ...gitLines(["diff", "--name-only"]),
    ...gitLines(["ls-files", "--others", "--exclude-standard"]),
  ];
  if (waiting.length) {
    console.error(dim(`\n${waiting.length} file(s) waiting:`));
    list(waiting);
    console.error(
      `\nStage them first:  ${bold("git add <file>")}  or  ${bold("git add -A")}\n`,
    );
  } else {
    console.error(dim("\nThe working tree is clean — nothing to commit.\n"));
  }
  process.exit(1);
}

const staged = gitLines(["diff", "--cached", "--name-only"]);
console.log(
  `\n${bold("Staged")} ${dim(`(${staged.length} file${staged.length === 1 ? "" : "s"})`)}`,
);
list(staged);

if (skipChecks) {
  console.log(`\n${yellow("Skipping checks (--skip-checks).")}`);
} else {
  console.log(`\n${bold("Checks")}`);
  const started = Date.now();

  for (const [script, label] of CHECKS) {
    process.stdout.write(dim(`  ${label} … `));
    const at = Date.now();
    const result = runScript(script);

    if (result.status !== 0) {
      console.log(red("failed"));
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
      if (output) console.log(`\n${output}\n`);
      console.error(red(`${label} failed — nothing was committed.`));
      console.error(
        dim(
          "Fix it and run npm run commit again, or skip with npm run commit -- --skip-checks\n",
        ),
      );
      process.exit(result.status ?? 1);
    }

    console.log(
      `${green("ok")} ${dim(`${((Date.now() - at) / 1000).toFixed(1)}s`)}`,
    );
  }

  console.log(
    dim(`  all passed in ${((Date.now() - started) / 1000).toFixed(1)}s`),
  );
}

console.log(`\n${bold("Message")}\n`);

const cz = spawnSync(process.execPath, [commitizenEntry()], {
  stdio: "inherit",
});
process.exit(cz.status ?? 1);
