import axios from "axios";

// const baseURL: 'https://statging-api-cde05b14206c.herokuapp.com/api/'

const axiosInstance = axios.create({
  // baseURL: 'https://statging-api-cde05b14206c.herokuapp.com/api',
  // baseURL: 'https://staging-pos-apis.onrender.com/api',
  baseURL: "http://localhost:3000/api",
  // You can set other default options here
  // timeout: 10000,
  // headers: {'X-Custom-Header': 'foobar'},
  validateStatus: () => true,
});

// ----- OPTIONAL: REQUEST INTERCEPTOR -----
axiosInstance.interceptors.request.use(
  (config) => {
    // Example: Attach token from localStorage if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach tenant slug header for tenant portal users
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    if (
      userData?.portal?.toLowerCase() === "tenant" &&
      userData?.tenant?.slug
    ) {
      config.headers["x-tenant-slug"] = userData.tenant.slug;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ----- OPTIONAL: RESPONSE INTERCEPTOR -----
axiosInstance.interceptors.response.use(
  (response) => {
    // If you need to transform or log the response, do it here
    return response;
  },
  (error) => {
    // If the response is an error (4xx, 5xx), handle globally
    // e.g., log out user on 401, show toast message, etc.
    // if (error.response && error.response.status === 401) {
    //   // handle unauthorized
    // }
    return Promise.reject(error);
  },
);

export default axiosInstance;
