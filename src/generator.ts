import { chmod, mkdir } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { installProjectSkills, type SkillInstallSummary } from "./skills/installer";
import { getAllProjectTemplates } from "./templates";
import { withSpinner } from "./tui";
import type { ScaffoldConfig } from "./types";

export interface GenerateResult {
  targetDir: string;
  filesWritten: string[];
  skillSummary: SkillInstallSummary;
  depsInstalled: boolean;
  postgresPort: number;
}

export function applyPlaceholders(
  content: string,
  config: ScaffoldConfig,
  postgresPort = 5432,
): string {
  return content
    .replaceAll("<project-slug>", config.projectSlug)
    .replaceAll("@<scope>", `@${config.scope}`)
    .replaceAll("<postgres-port>", String(postgresPort));
}

async function isPortListening(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host });
    socket.setTimeout(250);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

export async function findAvailablePostgresPort(startPort = 5432): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    const inUseV4 = await isPortListening(port, "127.0.0.1");
    const inUseV6 = await isPortListening(port, "::1");
    if (!inUseV4 && !inUseV6) {
      return port;
    }
  }
  return startPort;
}

export async function generateProject(config: ScaffoldConfig): Promise<GenerateResult> {
  const templates = getAllProjectTemplates(config.includeTodos ?? true);
  const filesWritten: string[] = [];
  const existingEnvPath = path.join(config.targetDir, ".env");
  let existingPort: number | undefined;
  if (await Bun.file(existingEnvPath).exists()) {
    const envText = await Bun.file(existingEnvPath).text();
    const match = envText.match(/^POSTGRES_PORT=(\d+)/m);
    if (match?.[1]) {
      existingPort = Number.parseInt(match[1], 10);
    }
  }
  const postgresPort = existingPort ?? (await findAvailablePostgresPort(5432));

  await withSpinner("Generating monorepo architecture & auth modules", async (update) => {
    await mkdir(config.targetDir, { recursive: true });

    for (const tpl of templates) {
      update(tpl.path);
      const fullPath = path.join(config.targetDir, tpl.path);
      await mkdir(path.dirname(fullPath), { recursive: true });
      const rendered = applyPlaceholders(tpl.content, config, postgresPort);
      await Bun.write(fullPath, rendered);

      if (tpl.executable && process.platform !== "win32") {
        await chmod(fullPath, 0o755);
      }
      filesWritten.push(tpl.path);
    }
  });

  let skillSummary: SkillInstallSummary = {
    totalSkills: 0,
    customSkills: 0,
    externalSkills: 0,
    externalFetchedRepos: [],
    installedSkillNames: [],
  };

  if (config.installSkills) {
    skillSummary = await withSpinner(
      "Installing AI Agent Skills into .agents/skills",
      async (update) => installProjectSkills(config, update),
    );
  }

  let depsInstalled = false;
  if (config.installDeps) {
    depsInstalled = await withSpinner(
      "Resolving workspace dependencies (bun install)",
      async () => runBunInstall(config.targetDir),
    );
  }

  return {
    targetDir: config.targetDir,
    filesWritten,
    skillSummary,
    depsInstalled,
    postgresPort,
  };
}

async function runBunInstall(cwd: string): Promise<boolean> {
  try {
    const proc = Bun.spawn(["bun", "install"], {
      cwd,
      stdout: "ignore",
      stderr: "ignore",
      stdin: "ignore",
    });
    const code = await proc.exited;
    return code === 0;
  } catch {
    return false;
  }
}
