import { request } from "./api";
import i18n from "../i18n";

const selectedLanguage = () => (i18n.resolvedLanguage === "km" ? "km" : "en");

function createScan({ inputType, value }) {
  const endpoint = inputType === "URL" ? "/v1/scans/url" : "/v1/scans/text";
  return request(endpoint, { method: "post", data: { value, language: selectedLanguage() } });
}

function createImageScan(image) {
  const data = new FormData();
  data.append("language", selectedLanguage());
  data.append("image", image);
  return request("/v1/scans/image", {
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

function deleteScan(scanId) {
  return request(`/v1/scans/${scanId}`, { method: "delete" });
}

export { createImageScan, createScan, deleteScan, getScan, listScans };
