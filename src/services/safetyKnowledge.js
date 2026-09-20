import { request } from "./api";

function listSafetyKnowledge(language = "en") {
  return request("/v1/safety-knowledge", { params: { limit: 100, lang: language } });
}

function getSafetyKnowledge(slug, language = "en") {
  return request(`/v1/safety-knowledge/${encodeURIComponent(slug)}`, {
    params: { lang: language },
  });
}

export { getSafetyKnowledge, listSafetyKnowledge };
