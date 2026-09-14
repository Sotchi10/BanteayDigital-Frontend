import { request } from "./api";

function listSafetyKnowledge() {
  return request("/v1/safety-knowledge", { params: { limit: 100 } });
}

function getSafetyKnowledge(slug) {
  return request(`/v1/safety-knowledge/${encodeURIComponent(slug)}`);
}

export { getSafetyKnowledge, listSafetyKnowledge };
