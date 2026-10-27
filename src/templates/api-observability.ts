import type { TemplateFile } from "../types";

export function getApiObservabilityTemplates(): TemplateFile[] {
  return [
    {
      path: "apps/api/src/lib/logger.ts",
      content: `import { env } from "./env";

export type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  msg: string;
  timestamp: string;
  env: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>): void {
  if (env.APP_ENV === "test" && level !== "error") {
    return;
  }

  const payload: LogPayload = {
    level,
    msg,
    timestamp: new Date().toISOString(),
    env: env.APP_ENV,
    ...(meta ?? {}),
  };

  if (env.APP_ENV === "production") {
    const line = JSON.stringify(payload);
    if (level === "error") {
      console.error(line);
    } else {
      console.log(line);
    }
    return;
  }

  const tag = level.toUpperCase().padEnd(5);
  const extra = meta && Object.keys(meta).length > 0 ? \` \${JSON.stringify(meta)}\` : "";
  if (level === "error") {
    console.error(\`[\${payload.timestamp}] \${tag} \${msg}\${extra}\`);
  } else {
    console.log(\`[\${payload.timestamp}] \${tag} \${msg}\${extra}\`);
  }
}

export const logger = {
  info(msg: string, meta?: Record<string, unknown>) {
    emit("info", msg, meta);
  },
  warn(msg: string, meta?: Record<string, unknown>) {
    emit("warn", msg, meta);
  },
  error(msg: string, meta?: Record<string, unknown>) {
    emit("error", msg, meta);
  },
};
`,
    },
    {
      path: "apps/api/src/middleware/security.ts",
      content: `import { Elysia } from "elysia";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { AppError } from "./error-handler";

interface RateBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateBucket>();
const requestTimings = new WeakMap<Request, number>();
const WINDOW_MS = 60_000;
const AUTH_LIMIT = 30;
const API_LIMIT = 120;
const MAX_BUCKETS = 10_000;
let lastPruneAt = Date.now();

function pruneExpiredBuckets(now: number): void {
  if (now - lastPruneAt < WINDOW_MS && buckets.size < MAX_BUCKETS) {
    return;
  }
  lastPruneAt = now;
  for (const [k, v] of buckets) {
    if (now >= v.resetAt) {
      buckets.delete(k);
    }
  }
  if (buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey) buckets.delete(oldestKey);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterSec: number) {
    super("RATE_LIMIT_EXCEEDED", "Too many requests. Please try again shortly.", 429, {
      retryAfterSec,
    });
  }
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export const securityPlugin = new Elysia({ name: "security-and-rate-limit" })
  .onRequest(({ request, set }) => {
    requestTimings.set(request, performance.now());
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
    set.headers["x-request-id"] = requestId;
    set.headers["x-content-type-options"] = "nosniff";
    set.headers["x-frame-options"] = "DENY";
    set.headers["referrer-policy"] = "strict-origin-when-cross-origin";

    if (env.APP_ENV === "test" || request.method === "OPTIONS") {
      return;
    }

    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) {
      return;
    }

    const now = Date.now();
    pruneExpiredBuckets(now);

    const isAuthRoute = url.pathname.startsWith("/api/auth/");
    const limit = isAuthRoute ? AUTH_LIMIT : API_LIMIT;
    const key = \`\${getClientIp(request)}:\${isAuthRoute ? "auth" : "api"}\`;

    const current = buckets.get(key);
    if (!current || now >= current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      set.headers["x-ratelimit-limit"] = String(limit);
      set.headers["x-ratelimit-remaining"] = String(limit - 1);
      return;
    }

    current.count += 1;
    const remaining = Math.max(0, limit - current.count);
    set.headers["x-ratelimit-limit"] = String(limit);
    set.headers["x-ratelimit-remaining"] = String(remaining);

    if (current.count > limit) {
      const retryAfterSec = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      set.headers["retry-after"] = String(retryAfterSec);
      throw new RateLimitError(retryAfterSec);
    }
  })
  .onAfterResponse(({ request, set }) => {
    if (env.APP_ENV === "test") return;
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return;
    const started = requestTimings.get(request);
    const durationMs = started ? Math.round((performance.now() - started) * 100) / 100 : 0;
    logger.info("HTTP request completed", {
      method: request.method,
      path: url.pathname,
      status: set.status ?? 200,
      durationMs,
      requestId: set.headers["x-request-id"],
    });
  });
`,
    },
    {
      path: "apps/api/src/modules/system/index.ts",
      content: `import { sqlClient } from "@<scope>/db";
import { Elysia } from "elysia";
import { env } from "../../lib/env";
import { ForbiddenError } from "../../middleware/error-handler";

export const systemModule = new Elysia()
  .get("/health", async ({ set }) => {
    const start = performance.now();
    let dbStatus: "connected" | "disconnected" = "connected";
    if (env.APP_ENV !== "test") {
      try {
        await sqlClient\`SELECT 1\`;
      } catch {
        dbStatus = "disconnected";
        set.status = 503;
      }
    }
    const dbLatencyMs = Math.round((performance.now() - start) * 100) / 100;
    return {
      success: dbStatus === "connected",
      data: {
        status: dbStatus === "connected" ? ("ok" as const) : ("degraded" as const),
        database: dbStatus,
        dbLatencyMs,
        uptimeSec: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: env.APP_ENV,
      },
    };
  })
  .post("/admin/reset-state", ({ request }) => {
    if (!env.ENABLE_RESET_API) {
      throw new ForbiddenError("State reset API is disabled in this environment.");
    }
    const apiKey = request.headers.get("x-reset-api-key");
    if (apiKey !== env.RESET_API_KEY) {
      throw new ForbiddenError("Invalid reset API key.");
    }
    return {
      success: true,
      data: { reset: true, timestamp: new Date().toISOString() },
    };
  });
`,
    },
    {
      path: "apps/api/src/modules/system/system.test.ts",
      content: `import { describe, expect, it } from "bun:test";
import { systemModule } from "./index";

describe("systemModule", () => {
  it("returns 200 ok with database probe metadata on /health", async () => {
    const res = await systemModule.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { status: string; database: string; uptimeSec: number };
    };
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("ok");
    expect(body.data.database).toBe("connected");
    expect(typeof body.data.uptimeSec).toBe("number");
  });
});
`,
    },
  ];
}
