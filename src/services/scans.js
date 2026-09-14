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

export { createImageScan, createScan };
