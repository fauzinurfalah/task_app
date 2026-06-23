import axios from 'axios';

const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, // Adjust if your backend port is different
    headers: {
        'Accept': 'application/json'
    }
});

// Interceptor for sending auth token
axiosClient.interceptors.request.use((config) => {
    // In Login.jsx we saved token, but wait, Login.jsx only saved 'user'. We didn't save 'token'.
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        try {
            const { response } = error;
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Redirect to login if token is invalid
                window.location.href = '/';
            }
        } catch (e) {
            console.error(e);
        }
        throw error;
    }
);

export default axiosClient;
