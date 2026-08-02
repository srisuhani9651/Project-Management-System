import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to automatically attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pf_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
