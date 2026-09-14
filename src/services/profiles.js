import { request } from "./api";

function getPublicProfile(username) {
  return request(`/v1/users/${encodeURIComponent(username)}`);
}

export { getPublicProfile };
