import axios from "axios";

// Localhost дээр бол 8000, интернэтэд бол Render-ийн хаяг руу хандана
const API_URL =
  process.env.REACT_APP_API_URL || "https://opendeal-api.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Нэвтэрсэн хэрэглэгчийн Token-ийг хүсэлт болгонд АВТОМАТААР хавсаргах
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers = config.headers ?? {};
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
