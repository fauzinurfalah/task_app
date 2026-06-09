import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Adjust if your backend port is different
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Interceptor for sending auth token
axiosClient.interceptors.request.use((config) => {
    // In Login.jsx we saved token, but wait, Login.jsx only saved 'user'. We didn't save 'token'.
    // Let me check Login.jsx first.
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
                window.location.href = '/login';
            }
        } catch (e) {
            console.error(e);
        }
        throw error;
    }
);

export default axiosClient;
