export type IntegrationId = "spotify" | "github";

export interface IntegrationSummary {
  id: IntegrationId;
  name: string;
  authentication: string;
  description: string;
  enabled: boolean;
  connected: boolean;
  capabilities: string[];
  managementRoute: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface ControlPlaneSummary {
  title: string;
  status: string;
  statusTone: "healthy" | "warning" | "neutral";
  managementRoute: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
}

export interface DiagnosticLogEntry {
  id: string;
  timestamp: string;
  severity: "info" | "warn" | "error";
  subsystem: string;
  operation: string;
  message: string;
  durationMs?: number;
}