import { request } from "./api";
import i18n from "../i18n";

const selectedLanguage = () => (i18n.resolvedLanguage === "km" ? "km" : "en");

function createScan({ inputType, value }) {
  return request("/v1/scans", { method: "post", data: { inputType, value, language: selectedLanguage() } });
}

function createImageScan(image) {
  const data = new FormData();
  data.append("inputType", "IMAGE");
  data.append("language", selectedLanguage());
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
