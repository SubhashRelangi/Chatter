import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000,
});

export default axiosInstance;
