#!/usr/bin/env bun
import { resolveConfig } from "./cli";
import { generateProject } from "./generator";
import { printAnimatedBanner, printSuccessBox, ui } from "./tui";

async function main() {
  const args = process.argv.slice(2);
  const isNonInteractive = !process.stdin.isTTY || args.includes("-y") || args.includes("--yes");

  if (isNonInteractive && !args.includes("-h") && !args.includes("--help")) {
    await printAnimatedBanner();
  }

  const config = await resolveConfig(args, process.cwd());
  if (!config) {
    return;
  }

  console.log(`\n  ${ui.bold(ui.white("Initializing Workspace..."))}`);
  const result = await generateProject(config);

  printSuccessBox({
    projectSlug: config.projectSlug,
    scope: config.scope,
    targetDir: result.targetDir,
    fileCount: result.filesWritten.length,
    skillCount: result.skillSummary.totalSkills,
    depsInstalled: result.depsInstalled,
    postgresPort: result.postgresPort,
  });
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(`\n  ${ui.red("✖")} Scaffolding failed:`, err);
    process.exit(1);
  });
}
