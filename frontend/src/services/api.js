import axios from "axios";

const BASE = "http://127.0.0.1:8000";

export const getProfiles = () => axios.get(`${BASE}/profiles/list`);
export const createProfile = (userData) => axios.post(`${BASE}/profiles/create`, userData);
export const getRecommendations = (profileId) => axios.post(`${BASE}/recommendations/${profileId}/today`);
export const sendFeedback = (profileId, recoId, action, alt = null) =>
  axios.post(`${BASE}/feedback/${profileId}/recommendation/${recoId}`, {
    action,
    edits: alt ? { alternative: alt } : {}
  });
export const getInsights = (profileId) => axios.get(`${BASE}/insights/${profileId}/summary`);
export const getWearable = (profileId) => axios.get(`${BASE}/wearables/${profileId}/today`);
export const getFamily = (profileId) => axios.get(`${BASE}/profiles/${profileId}/family`);
export const getSelfcare = (profileId) => axios.get(`${BASE}/profiles/${profileId}/selfcare`);
