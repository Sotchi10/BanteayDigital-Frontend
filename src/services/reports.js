import { request } from "./api";

function createReportFromScan(scanId, data) {
  return request(`/v1/scans/${scanId}/report`, { method: "post", data });
}

function listReports() {
  return request("/v1/reports", { method: "get", params: { limit: 100 } });
}

export { createReportFromScan, listReports };
