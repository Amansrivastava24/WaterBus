import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    try {
        const userInfoStr = localStorage.getItem('userInfo');
        console.log('API Request Interceptor - userInfoStr:', userInfoStr);
        if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            if (userInfo && userInfo.token) {
                config.headers.Authorization = `Bearer ${userInfo.token}`;
                console.log('Token attached to request');
            } else {
                console.warn('UserInfo found but no token present');
            }
        } else {
            console.warn('No userInfo found in localStorage');
        }
    } catch (error) {
        console.error('Error in API interceptor:', error);
    }
    return config;
});

export default api;
