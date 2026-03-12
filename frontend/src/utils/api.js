import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getToken = () => localStorage.getItem('token');

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

export const api = {
  auth: {
    register: (data) => axios.post(`${API}/auth/register`, data),
    login: (data) => axios.post(`${API}/auth/login`, data),
    getMe: () => axios.get(`${API}/auth/me`, getAuthHeaders()),
  },
  pregnancy: {
    calculate: (data) => axios.post(`${API}/pregnancy/calculate`, data, getAuthHeaders()),
    getProfile: () => axios.get(`${API}/pregnancy/profile`, getAuthHeaders()),
  },
  scan: {
    barcode: (barcode) => axios.post(`${API}/scan/barcode?barcode=${barcode}`, {}, getAuthHeaders()),
    search: (query) => axios.post(`${API}/scan/search?query=${query}`, {}, getAuthHeaders()),
  },
  foods: {
    getSafe: () => axios.get(`${API}/foods/safe`, getAuthHeaders()),
  },
  history: {
    getSearch: () => axios.get(`${API}/history/search`, getAuthHeaders()),
  },
  notifications: {
    create: (data) => axios.post(`${API}/notifications`, data, getAuthHeaders()),
    getAll: () => axios.get(`${API}/notifications`, getAuthHeaders()),
    update: (id, completed) => axios.put(`${API}/notifications/${id}?completed=${completed}`, {}, getAuthHeaders()),
    delete: (id) => axios.delete(`${API}/notifications/${id}`, getAuthHeaders()),
  },
  tips: {
    getWeekly: (week) => axios.get(`${API}/tips/weekly/${week}`, getAuthHeaders()),
  },
  embryo: {
    getWeek: (week) => axios.get(`${API}/embryo/week/${week}`, getAuthHeaders()),
  },
  location: {
    getServices: (params) => axios.get(`${API}/location/services`, { params }),
  },
  email: {
    send: (data) => axios.post(`${API}/email/send`, data, getAuthHeaders()),
    sendReminder: (notificationId) => axios.post(`${API}/email/send-reminder?notification_id=${notificationId}`, {}, getAuthHeaders()),
    sendWeeklyTip: (week) => axios.post(`${API}/email/send-weekly-tip?week=${week}`, {}, getAuthHeaders()),
  },
  preferences: {
    get: () => axios.get(`${API}/notifications/preferences`, getAuthHeaders()),
    update: (data) => axios.post(`${API}/notifications/preferences`, data, getAuthHeaders()),
  },
};

export default api;
