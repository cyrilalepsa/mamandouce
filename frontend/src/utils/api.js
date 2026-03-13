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
    me: () => axios.get(`${API}/auth/me`, getAuthHeaders()), // Alias for compatibility
    forgotPassword: (email) => axios.post(`${API}/auth/forgot-password`, { email }),
    verifyResetToken: (token) => axios.post(`${API}/auth/verify-reset-token`, { token }),
    resetPassword: (token, new_password) => axios.post(`${API}/auth/reset-password`, { token, new_password }),
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
  foodLibrary: {
    getAll: (params) => axios.get(`${API}/food-library?${params}`, getAuthHeaders()),
    addFood: (data) => axios.post(`${API}/user-added-foods`, data, getAuthHeaders()),
    getUserAdded: () => axios.get(`${API}/user-added-foods`, getAuthHeaders()),
  },
  birthList: {
    get: () => axios.get(`${API}/birth-list`, getAuthHeaders()),
    create: () => axios.post(`${API}/birth-list`, {}, getAuthHeaders()),
    addItem: (item) => axios.post(`${API}/birth-list/items`, item, getAuthHeaders()),
    removeItem: (itemId) => axios.delete(`${API}/birth-list/items/${itemId}`, getAuthHeaders()),
    toggleReserved: (itemId) => axios.post(`${API}/birth-list/items/${itemId}/toggle`, {}, getAuthHeaders()),
    getShared: (shareId) => axios.get(`${API}/birth-list/shared/${shareId}`),
    toggleReservedShared: (shareId, itemId) => axios.post(`${API}/birth-list/shared/${shareId}/items/${itemId}/toggle`),
  },
  subscription: {
    getStatus: () => axios.get(`${API}/subscription-status`, getAuthHeaders()),
    redeemCode: (code) => axios.post(`${API}/redeem-code`, { code }, getAuthHeaders()),
  },
  admin: {
    generateCodes: (count, note) => axios.post(`${API}/admin/generate-codes?count=${count}&note=${encodeURIComponent(note)}`, {}, getAuthHeaders()),
    getCodes: () => axios.get(`${API}/admin/promo-codes`, getAuthHeaders()),
    getUsers: () => axios.get(`${API}/admin/users`, getAuthHeaders()),
    getStats: () => axios.get(`${API}/admin/stats`, getAuthHeaders()),
    getPendingFoods: () => axios.get(`${API}/admin/pending-foods`, getAuthHeaders()),
    updateFoodStatus: (foodId, status) => axios.post(`${API}/admin/food-status/${foodId}?status=${status}`, {}, getAuthHeaders()),
    getMessages: () => axios.get(`${API}/admin/messages`, getAuthHeaders()),
    markMessageRead: (messageId) => axios.post(`${API}/admin/messages/${messageId}/read`, {}, getAuthHeaders()),
    replyToMessage: (messageId, reply) => axios.post(`${API}/admin/messages/${messageId}/reply`, { reply }, getAuthHeaders()),
  },
  contact: {
    sendMessage: (data) => axios.post(`${API}/contact/send`, data, getAuthHeaders()),
    getMyMessages: () => axios.get(`${API}/contact/my-messages`, getAuthHeaders()),
  },
  notifications: {
    getVapidKey: () => axios.get(`${API}/notifications/vapid-public-key`),
    subscribe: (subscription, userEmail) => axios.post(`${API}/notifications/subscribe`, { subscription, user_email: userEmail }, getAuthHeaders()),
    unsubscribe: (subscription) => axios.post(`${API}/notifications/unsubscribe`, { subscription }, getAuthHeaders()),
  },
  history: {
    getSearch: () => axios.get(`${API}/history/search`, getAuthHeaders()),
  },
  favorites: {
    add: (data) => axios.post(`${API}/favorites`, data, getAuthHeaders()),
    getAll: () => axios.get(`${API}/favorites`, getAuthHeaders()),
    remove: (foodName) => axios.delete(`${API}/favorites/${encodeURIComponent(foodName)}`, getAuthHeaders()),
    check: (foodName) => axios.get(`${API}/favorites/check/${encodeURIComponent(foodName)}`, getAuthHeaders()),
  },
  alerts: {
    getPersonalized: () => axios.get(`${API}/alerts/personalized`, getAuthHeaders()),
  },
  medical: {
    getAppointments: () => axios.get(`${API}/medical/appointments`, getAuthHeaders()),
    getUpcoming: () => axios.get(`${API}/medical/upcoming`, getAuthHeaders()),
    markComplete: (appointmentId) => axios.post(`${API}/medical/complete/${appointmentId}`, {}, getAuthHeaders()),
    unmarkComplete: (appointmentId) => axios.delete(`${API}/medical/complete/${appointmentId}`, getAuthHeaders()),
    saveNotes: (appointmentId, data) => axios.post(`${API}/medical/notes/${appointmentId}`, data, getAuthHeaders()),
    getNotes: (appointmentId) => axios.get(`${API}/medical/notes/${appointmentId}`, getAuthHeaders()),
    getAllNotes: () => axios.get(`${API}/medical/notes`, getAuthHeaders()),
    getHealthSummary: () => axios.get(`${API}/medical/health-summary`, getAuthHeaders()),
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
  subscription: {
    createCheckout: (data) => axios.post(`${API}/payments/checkout/session`, data, getAuthHeaders()),
    checkStatus: (sessionId) => axios.get(`${API}/payments/checkout/status/${sessionId}`, getAuthHeaders()),
  },
};

export default api;
