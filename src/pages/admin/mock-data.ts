import type {
  ControlPlaneSummary,
  DashboardMetric,
  DiagnosticLogEntry,
  IntegrationSummary,
} from "./types";

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "INTEGRATIONS",
    value: "2",
    detail: "1 connected",
  },
  {
    label: "MCP SERVER",
    value: "Disabled",
    detail: "0 tools exposed",
  },
  {
    label: "SITE",
    value: "Healthy",
    detail: "0 runtime overrides",
  },
  {
    label: "LOGS",
    value: "12",
    detail: "events / 24h",
  },
];

export const integrations: IntegrationSummary[] = [
  {
    id: "spotify",
    name: "Spotify",
    authentication: "OAuth · public playback backend",
    description: "Owner-account playback integration",
    enabled: true,
    connected: true,
    capabilities: ["playback.read", "queue.read"],
    managementRoute: "/admin/integrations/spotify",
  },
  {
    id: "github",
    name: "GitHub",
    authentication: "GitHub App · repository service",
    description: "Controlled repository service",
    enabled: false,
    connected: false,
    capabilities: ["contents.read", "contents.write"],
    managementRoute: "/admin/integrations/github",
  },
];

export const controlPlaneSummaries: ControlPlaneSummary[] = [
  {
    title: "MCP Server",
    status: "Disabled",
    statusTone: "warning",
    managementRoute: "/admin/mcp",
    rows: [
      { label: "Endpoint", value: "Not configured" },
      { label: "Tools", value: "0 enabled" },
      { label: "Access policy", value: "Not configured" },
    ],
  },
  {
    title: "Site Runtime",
    status: "Healthy",
    statusTone: "healthy",
    managementRoute: "/admin/site",
    rows: [
      { label: "Overrides", value: "0 active" },
      { label: "Properties", value: "No mutable settings" },
      { label: "Deployment", value: "Production" },
    ],
  },
];

export const diagnosticLogs: DiagnosticLogEntry[] = [
  {
    id: "log-1",
    timestamp: "10:42:18.220",
    severity: "info",
    subsystem: "spotify.health",
    message: "token refresh + playback probe succeeded · 184 ms",
  },
  {
    id: "log-2",
    timestamp: "10:39:02.714",
    severity: "warn",
    subsystem: "github.status",
    message: "integration disabled · no installation configured",
  },
  {
    id: "log-3",
    timestamp: "10:31:44.091",
    severity: "info",
    subsystem: "admin.auth",
    message: "authenticated control-plane request",
  },
];