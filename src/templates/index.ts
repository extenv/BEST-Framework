import type { TemplateFile } from "../types";
import { getApiCoreTemplates } from "./api-core";
import { getApiModuleTemplates } from "./api-modules";
import { getApiObservabilityTemplates } from "./api-observability";
import { getCiTemplates } from "./ci";
import { getDbTemplates } from "./db";
import { getDocsTemplates } from "./docs";
import { getRootTemplates } from "./root";
import { getSharedTemplates } from "./shared";
import { getWebCoreTemplates } from "./web-core";
import { getWebRouteTemplates } from "./web-routes";

export function getAllProjectTemplates(includeTodos = true): TemplateFile[] {
  return [
    ...getRootTemplates(),
    ...getCiTemplates(),
    ...getDocsTemplates(),
    ...getSharedTemplates(includeTodos),
    ...getDbTemplates(includeTodos),
    ...getApiCoreTemplates(),
    ...getApiObservabilityTemplates(),
    ...getApiModuleTemplates(includeTodos),
    ...getWebCoreTemplates(includeTodos),
    ...getWebRouteTemplates(includeTodos),
  ];
}
