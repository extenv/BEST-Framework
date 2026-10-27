import path from "node:path";
import { createInterface } from "node:readline/promises";
import { formatStepPrompt, printAnimatedBanner, printStepDone, ui } from "./tui";
import { ALL_ROLES, type ScaffoldConfig, type SkillRole } from "./types";

export interface ParsedCliArgs {
  help: boolean;
  yes: boolean;
  projectSlug?: string;
  scope?: string;
  targetDir?: string;
  roles?: SkillRole[];
  includeTodos?: boolean;
  installSkills?: boolean;
  fetchExternalSkills?: boolean;
  installDeps?: boolean;
}

export function parseCliArgs(argv: string[]): ParsedCliArgs {
  const result: ParsedCliArgs = {
    help: false,
    yes: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;

    if (arg === "-h" || arg === "--help") {
      result.help = true;
    } else if (arg === "-y" || arg === "--yes") {
      result.yes = true;
    } else if (arg === "--name" || arg === "-n") {
      result.projectSlug = sanitizeSlug(argv[++i] ?? "best-stack");
    } else if (arg === "--scope" || arg === "-s") {
      result.scope = sanitizeScope(argv[++i] ?? "best-stack");
    } else if (arg === "--out" || arg === "--dir" || arg === "-o") {
      result.targetDir = argv[++i];
    } else if (arg === "--roles" || arg === "-r") {
      result.roles = parseRolesInput(argv[++i] ?? "all");
    } else if (arg === "--no-todos" || arg === "--without-todos") {
      result.includeTodos = false;
    } else if (arg === "--todos" || arg === "--with-todos") {
      result.includeTodos = true;
    } else if (arg === "--no-skills") {
      result.installSkills = false;
    } else if (arg === "--offline-skills" || arg === "--skip-external-skills") {
      result.fetchExternalSkills = false;
    } else if (arg === "--fetch-skills") {
      result.fetchExternalSkills = true;
    } else if (arg === "--no-install" || arg === "--skip-install") {
      result.installDeps = false;
    } else if (arg === "--install") {
      result.installDeps = true;
    } else if (!arg.startsWith("-") && !result.projectSlug) {
      result.projectSlug = sanitizeSlug(arg);
    }
  }

  return result;
}

export function sanitizeSlug(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "best-stack";
}

export function sanitizeScope(input: string): string {
  const withoutAt = input.trim().replace(/^@+/, "");
  return sanitizeSlug(withoutAt);
}

export function parseRolesInput(input: string): SkillRole[] {
  const normalized = input.trim().toLowerCase();
  if (!normalized || normalized === "all" || normalized === "*" || normalized === "1") {
    return ALL_ROLES.map((r) => r.id);
  }
  if (normalized === "2" || normalized === "engineering") {
    return ["tech-lead", "be", "fe", "qa", "general"];
  }
  if (normalized === "3" || normalized === "product") {
    return ["ba", "pm", "uiux", "general"];
  }
  const validIds = new Set<SkillRole>(ALL_ROLES.map((r) => r.id));
  const selected = normalized
    .split(",")
    .map((s) => s.trim() as SkillRole)
    .filter((s) => validIds.has(s));

  return selected.length > 0 ? selected : ALL_ROLES.map((r) => r.id);
}

export async function resolveConfig(argv: string[], cwd: string): Promise<ScaffoldConfig | null> {
  const parsed = parseCliArgs(argv);
  if (parsed.help) {
    printHelp();
    return null;
  }

  const isInteractive = Boolean(process.stdin.isTTY) && !parsed.yes;

  if (!isInteractive) {
    const projectSlug = parsed.projectSlug ?? "best-stack";
    const scope = parsed.scope ?? projectSlug;
    const targetDir = path.resolve(cwd, parsed.targetDir ?? projectSlug);
    return {
      projectSlug,
      scope,
      targetDir,
      roles: parsed.roles ?? ALL_ROLES.map((r) => r.id),
      includeTodos: parsed.includeTodos ?? true,
      installSkills: parsed.installSkills ?? true,
      fetchExternalSkills: parsed.fetchExternalSkills ?? true,
      installDeps: parsed.installDeps ?? true,
      overwrite: true,
    };
  }

  await printAnimatedBanner();
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const defaultSlug = parsed.projectSlug ?? "best-stack";
    const slugAns = await rl.question(formatStepPrompt(1, 6, "Project Identifier", defaultSlug));
    const projectSlug = sanitizeSlug(slugAns || defaultSlug);
    printStepDone("Project", projectSlug);

    const defaultScope = parsed.scope ?? projectSlug;
    const scopeAns = await rl.question(
      formatStepPrompt(2, 6, "Workspace Package Scope", `@${defaultScope}`),
    );
    const scope = sanitizeScope(scopeAns || defaultScope);
    printStepDone("Scope", `@${scope}`);

    const defaultOut = parsed.targetDir ?? `./${projectSlug}`;
    const outAns = await rl.question(formatStepPrompt(3, 6, "Output Directory", defaultOut));
    const targetDir = path.resolve(cwd, (outAns || defaultOut).trim());
    printStepDone("Directory", targetDir);

    const defaultTodos = parsed.includeTodos ?? true;
    const todosAns = (
      await rl.question(
        formatStepPrompt(4, 6, "Include Sample Todos Module (y/n)", defaultTodos ? "y" : "n"),
      )
    )
      .trim()
      .toLowerCase();
    const includeTodos = todosAns ? todosAns === "y" || todosAns === "yes" : defaultTodos;
    printStepDone(
      "Sample Todos",
      includeTodos ? "Included (DTO + DB + API + UI)" : "Skipped (Clean Auth Only)",
    );

    console.log(`\n  ${ui.brightCyan("◆")} ${ui.cyan("[5/6]")} ${ui.bold(ui.white("AI Agent Skill Suite"))}`);
    console.log(`    ${ui.brightGreen("1)")} ${ui.bold("Full-Stack Enterprise")} ${ui.gray("— All 53 skills across 9 SDLC roles (Recommended)")}`);
    console.log(`    ${ui.cyan("2)")} ${ui.white("Core Engineering")}      ${ui.gray("— Tech Lead, Backend, Frontend, QA & General")}`);
    console.log(`    ${ui.cyan("3)")} ${ui.white("Product & Design")}      ${ui.gray("— BA, PM, UI/UX & General")}`);
    console.log(`    ${ui.cyan("4)")} ${ui.white("Custom Roles")}          ${ui.gray("— e.g. be,fe,tech-lead,infra")}`);

    const roleChoice = (await rl.question(`  ${ui.brightCyan("╰─▸")} Select preset [1-4] (1): `)).trim();
    let roles: SkillRole[];
    if (roleChoice === "4") {
      const customRoles = await rl.question(
        `  ${ui.brightCyan("╰─▸")} Enter roles (${ALL_ROLES.map((r) => r.id).join(",")}): `,
      );
      roles = parseRolesInput(customRoles || "all");
    } else {
      roles = parsed.roles ?? parseRolesInput(roleChoice || "1");
    }
    printStepDone("Skills Profile", `${roles.length} role(s) selected`);

    console.log(`\n  ${ui.brightCyan("◆")} ${ui.cyan("[6/6]")} ${ui.bold(ui.white("Installation Mode"))}`);
    console.log(`    ${ui.brightGreen("1)")} ${ui.bold("Complete Setup")}   ${ui.gray("— Install dependencies + sync skills.sh registry")}`);
    console.log(`    ${ui.cyan("2)")} ${ui.white("Fast Local Setup")} ${ui.gray("— Install dependencies + local blueprint skills only")}`);
    console.log(`    ${ui.cyan("3)")} ${ui.white("Scaffold Only")}    ${ui.gray("— Generate project & local skills without bun install")}`);

    const modeAns = (await rl.question(`  ${ui.brightCyan("╰─▸")} Select mode [1-3] (1): `)).trim() || "1";
    const fetchExternalSkills = parsed.fetchExternalSkills ?? modeAns === "1";
    const installDeps = parsed.installDeps ?? modeAns !== "3";
    printStepDone(
      "Mode",
      modeAns === "3" ? "Scaffold Only" : modeAns === "2" ? "Fast Local Setup" : "Complete Setup",
    );

    return {
      projectSlug,
      scope,
      targetDir,
      roles,
      includeTodos,
      installSkills: parsed.installSkills ?? true,
      fetchExternalSkills,
      installDeps,
      overwrite: true,
    };
  } finally {
    rl.close();
  }
}

export function printHelp(): void {
  console.log(`
${ui.bold(ui.brightCyan("BEST-STACK"))} — Modular Monorepo & AI Skills Scaffolder

${ui.bold("Usage:")}
  bun run best [project-slug] [options]

${ui.bold("Options:")}
  -n, --name <slug>            Project slug (default: "best-stack")
  -s, --scope <scope>          Workspace scope without '@' (default: project slug)
  -o, --out <dir>              Target output directory (default: "./<project-slug>")
  -r, --roles <list>           Skill preset ("all", "engineering", "product") or comma list
  --no-todos                   Skip generating sample todos module (DTO, DB, API, UI)
  --offline-skills             Install all 53 SKILL.md files locally without network sync
  --no-skills                  Skip installing .agents/skills
  --no-install                 Skip running "bun install" in the generated project
  -y, --yes                    Accept all defaults (non-interactive mode)
  -h, --help                   Show this help message
`);
}
