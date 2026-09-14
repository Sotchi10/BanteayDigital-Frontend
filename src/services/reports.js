import { request } from "./api";

function createReportFromScan(scanId, data) {
  return request(`/v1/scans/${scanId}/report`, { method: "post", data });
}

export { createReportFromScan };
