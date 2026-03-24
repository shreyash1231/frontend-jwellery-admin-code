import { message } from "antd";
import { baseUrl, showConsole } from "./env";
import axios from "axios";

// SECURITY: Utility to sanitize HTML to prevent XSS
export function sanitizeHTML(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

// WARNING: sessionStorage is used for tokens. For best security, use httpOnly cookies if backend supports it.
// CSRF protection utility
function getCSRFToken() {
  const match = document.cookie.match(new RegExp('(^| )csrfToken=([^;]+)'));
  return match ? match[2] : null;
}


const axiosInstance = axios.create({
  baseURL: baseUrl,
});

const PUBLIC_PATHS = ['login', 'forget-password', 'reset-password', 'sendOtp'];

axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const isPublic = PUBLIC_PATHS.some((p) => url.includes(p));

    if (!isPublic) {
      const token = sessionStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      // Add CSRF token to all requests
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status; // fixed status reference
    const errorMsg = error.response?.data?.message || "Something went wrong!";

    const isPublicRequest = PUBLIC_PATHS.some((p) => (error?.config?.url || '').includes(p));

    if (status === 401 && !isPublicRequest) {
      sessionStorage.clear();
      message.error(errorMsg);
    //  window.location.href = "/admin/login";
    } else if (status === 400) {
      message.error(errorMsg);
    } else if (status === 404) {
      message.error(errorMsg);
    } else if (status === 500) {
      message.error(errorMsg);
    } else if (
      error.message === "Network Error" ||
      (typeof error.message === 'string' && error.message.includes("ERR_INTERNET_DISCONNECTED"))
    ) {
      message.error("Network Error Occured");
    } else {
      message.error(errorMsg);
    }

    return Promise.reject(error);
  }
);


// HTTP utility methods
const http = {
  post: (path, body) => axiosInstance.post(path, body).then((res) => res.data),

  get: (path) => axiosInstance.get(path).then((res) => res.data),

  postFormData: (path, body) =>
    axiosInstance
      .post(path, body, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data),

  put: (path, body) => axiosInstance.put(path, body).then((res) => res.data),

  putFormData: (path, body) =>
    axiosInstance
      .put(path, body, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data),

  delete: (path) => axiosInstance.delete(path).then((res) => res.data),

  patch: (path, body) => axiosInstance.patch(path, body).then((res) => res.data),
  resetPassword: (path, body) => {
    return new Promise(async (resolve, reject) => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("verifyToken")}`,
        // Add CSRF token to manual requests
        ...(getCSRFToken() ? { 'X-CSRF-Token': getCSRFToken() } : {}),
      };

      try {
        const res = await axios.patch(`${baseUrl}${path}`, body, { headers });
        resolve(res.data);
      } catch (err) {
        reject(err);
      }
    });
  },

  patchFormData: (path, body) =>
    axiosInstance
      .patch(path, body, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data),
};

const errorResponseHandler = (error) => {

  if (showConsole) {
    console.log(error.response.data.message);
  }
}

export { http, errorResponseHandler };



