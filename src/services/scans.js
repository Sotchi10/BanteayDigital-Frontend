import { request } from "./api";

function createScan({ inputType, value }) {
  return request("/v1/scans", { method: "post", data: { inputType, value } });
}

function createImageScan(image) {
  const data = new FormData();
  data.append("inputType", "IMAGE");
  data.append("image", image);
  return request("/v1/scans", {
    method: "post",
    data,
  });
}

function listScans() {
  return request("/v1/scans", { method: "get", params: { limit: 100 } });
}

function getScan(scanId) {
  return request(`/v1/scans/${scanId}`);
}

export { createImageScan, createScan, getScan, listScans };
