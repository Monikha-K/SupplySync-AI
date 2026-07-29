import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

export const assignDriver = (payload) => api.post("/assign-driver", payload);

export default api;