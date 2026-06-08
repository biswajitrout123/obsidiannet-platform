import axios from "axios";

const axiosInstance = axios.create({
    // Replace the Render URL with your actual backend URL if it is different
    baseURL: import.meta.env.MODE === "development" 
        ? "http://localhost:5000/api" 
        : "https://obsidiannet-backend.onrender.com/api",
    withCredentials: true,
});

export default axiosInstance;