import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust if deployed

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const auth = {
    login: (identifier: string, password: string) =>
        api.post('/auth/login', { register_number: identifier, password }),

    changePassword: (new_password: string) =>
        api.post('/auth/change-password', { new_password }),
};

export const admin = {
    createUser: (userData: any) => api.post('/admin/create-user', userData),
};

export const student = {
    getDashboard: () => api.get('/student/dashboard'),
    getAttendance: () => api.get('/student/attendance'),
    getMarks: () => api.get('/student/marks'),
    getTimetable: () => api.get('/student/timetable'),
};

export default api;
