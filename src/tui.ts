const ESC = "\x1b[";

export const ui = {
  reset: `${ESC}0m`,
  bold: (s: string) => `${ESC}1m${s}${ESC}0m`,
  dim: (s: string) => `${ESC}2m${s}${ESC}0m`,
  cyan: (s: string) => `${ESC}36m${s}${ESC}0m`,
  brightCyan: (s: string) => `${ESC}96m${s}${ESC}0m`,
  blue: (s: string) => `${ESC}34m${s}${ESC}0m`,
  magenta: (s: string) => `${ESC}35m${s}${ESC}0m`,
  green: (s: string) => `${ESC}32m${s}${ESC}0m`,
  brightGreen: (s: string) => `${ESC}92m${s}${ESC}0m`,
  yellow: (s: string) => `${ESC}33m${s}${ESC}0m`,
  red: (s: string) => `${ESC}31m${s}${ESC}0m`,
  white: (s: string) => `${ESC}97m${s}${ESC}0m`,
  gray: (s: string) => `${ESC}90m${s}${ESC}0m`,
  bgCyan: (s: string) => `${ESC}46m${ESC}30m${ESC}1m ${s} ${ESC}0m`,
  bgGreen: (s: string) => `${ESC}42m${ESC}30m${ESC}1m ${s} ${ESC}0m`,
};

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function printAnimatedBanner(): Promise<void> {
  const isTTY = Boolean(process.stdout.isTTY);
  const lines = [
    "",
    `  ${ui.brightCyan("╭──────────────────────────────────────────────────────────────╮")}`,
    `  ${ui.brightCyan("│")}  ${ui.bgCyan("BEST-STACK")}      ${ui.bold(ui.white("Enterprise Monorepo & AI Skills Engine"))}    ${ui.brightCyan("│")}`,
    `  ${ui.brightCyan("│")}  ${ui.gray("Bun · Turborepo · Elysia · Eden v2 · Better Auth · SolidJS")}  ${ui.brightCyan("│")}`,
    `  ${ui.brightCyan("╰──────────────────────────────────────────────────────────────╯")}`,
    "",
  ];

  for (const line of lines) {
    console.log(line);
    if (isTTY) {
      await sleep(22);
    }
  }
}

export async function withSpinner<T>(
  label: string,
  task: (updateText: (subtext: string) => void) => Promise<T>,
): Promise<T> {
  const isTTY = Boolean(process.stdout.isTTY);
  const start = performance.now();
  let frameIdx = 0;
  let currentSubtext = "";

  const updateText = (subtext: string) => {
    currentSubtext = subtext;
  };

  if (!isTTY) {
    const res = await task(updateText);
    const elapsed = Math.round(performance.now() - start);
    console.log(`  ${ui.brightGreen("✔")} ${label} ${ui.gray(`(${elapsed}ms)`)}`);
    return res;
  }

  const timer = setInterval(() => {
    const frame = SPINNER_FRAMES[frameIdx % SPINNER_FRAMES.length] ?? "⠋";
    frameIdx++;
    const suffix = currentSubtext ? ` ${ui.gray(`· ${currentSubtext}`)}` : "";
    process.stdout.write(`\r\x1b[2K  ${ui.brightCyan(frame)} ${ui.white(label)}${suffix}`);
  }, 70);

  try {
    // Brief visual beat so fast tasks still show smooth animation in TTY
    const [result] = await Promise.all([task(updateText), sleep(240)]);
    clearInterval(timer);
    const elapsed = Math.round(performance.now() - start);
    process.stdout.write(
      `\r\x1b[2K  ${ui.brightGreen("✔")} ${ui.white(label)} ${ui.gray(`(${elapsed}ms)`)}\n`,
    );
    return result;
  } catch (error) {
    clearInterval(timer);
    process.stdout.write(`\r\x1b[2K  ${ui.red("✖")} ${ui.white(label)}\n`);
    throw error;
  }
}

export function formatStepPrompt(step: number, total: number, title: string, hint: string): string {
  const badge = ui.cyan(`[${step}/${total}]`);
  return `  ${ui.brightCyan("◆")} ${badge} ${ui.bold(ui.white(title))} ${ui.gray(`(${hint})`)}\n  ${ui.brightCyan("╰─▸")} `;
}

export function printStepDone(label: string, value: string): void {
  console.log(`  ${ui.brightGreen("✔")} ${ui.gray(label.padEnd(18))} ${ui.brightCyan(value)}`);
}

export function printSuccessBox(params: {
  projectSlug: string;
  scope: string;
  targetDir: string;
  fileCount: number;
  skillCount: number;
  depsInstalled: boolean;
  postgresPort?: number;
}): void {
  const pgPort = params.postgresPort ?? 5432;
  console.log("");
  console.log(`  ${ui.brightGreen("╭──────────────────────────────────────────────────────────────╮")}`);
  console.log(
    `  ${ui.brightGreen("│")}  ${ui.bgGreen("READY")}  ${ui.bold(ui.white(`${params.projectSlug}`))} ${ui.gray(`(@${params.scope})`)}${" ".repeat(Math.max(1, 41 - params.projectSlug.length - params.scope.length))}${ui.brightGreen("│")}`,
  );
  console.log(`  ${ui.brightGreen("├──────────────────────────────────────────────────────────────┤")}`);
  console.log(
    `  ${ui.brightGreen("│")}  ${ui.gray("Workspace Files :")} ${ui.white(String(params.fileCount).padEnd(42))}${ui.brightGreen("│")}`,
  );
  console.log(
    `  ${ui.brightGreen("│")}  ${ui.gray("AI Agent Skills :")} ${ui.white(`${params.skillCount} installed in .agents/skills`.padEnd(42))}${ui.brightGreen("│")}`,
  );
  console.log(
    `  ${ui.brightGreen("│")}  ${ui.gray("PostgreSQL Port :")} ${ui.white(`${pgPort} (configured in .env & docker-compose.yml)`.padEnd(42))}${ui.brightGreen("│")}`,
  );
  console.log(
    `  ${ui.brightGreen("│")}  ${ui.gray("Auth & UI       :")} ${ui.white("Login, Register & Tasks (Minimalist UI)".padEnd(42))}${ui.brightGreen("│")}`,
  );
  console.log(`  ${ui.brightGreen("╰──────────────────────────────────────────────────────────────╯")}`);
  console.log("");
  console.log(`  ${ui.bold(ui.white("Next Commands:"))}`);
  console.log(`    ${ui.cyan("$")} cd ${params.projectSlug}`);
  if (!params.depsInstalled) {
    console.log(`    ${ui.cyan("$")} bun install`);
  }
  console.log(`    ${ui.cyan("$")} bun run docker:db       ${ui.gray(`# Start PostgreSQL on port ${pgPort}`)}`);
  console.log(`    ${ui.cyan("$")} bun run db:migrate      ${ui.gray("# Apply SQL migrations")}`);
  console.log(`    ${ui.cyan("$")} bun run dev             ${ui.gray("# Launch Web (3000) & API (3001)")}`);
  console.log("");
}
