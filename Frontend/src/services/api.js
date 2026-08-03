import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor — attach JWT Bearer token to every request
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

// Response interceptor — on 401 clear stale auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if it's NOT the login/signup endpoint itself
      const url = error.config?.url || ""
      const isAuthEndpoint = url.includes("/login") || url.includes("/signup") || url.includes("/register")
      if (!isAuthEndpoint) {
        localStorage.removeItem("pf_token")
        localStorage.removeItem("pf_user")
        localStorage.removeItem("pf_projects")
        // Redirect to login
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api
