import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const getToken = () => localStorage.getItem('token');

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Intercepteur global pour gérer les erreurs d'authentification
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expiré ou invalide - déconnecter l'utilisateur
      localStorage.removeItem('token');
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/pricing') {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    register: (data) => axios.post(`${API}/auth/register`, data),
    login: (data) => axios.post(`${API}/auth/login`, data),
    getMe: () => axios.get(`${API}/auth/me`, getAuthHeaders()),
    me: () => axios.get(`${API}/auth/me`, getAuthHeaders()), // Alias for compatibility
    updateProfile: (data) => axios.put(`${API}/auth/profile`, data, getAuthHeaders()),
    forgotPassword: (email) => axios.post(`${API}/auth/forgot-password`, { email }),
    verifyResetToken: (token) => axios.post(`${API}/auth/verify-reset-token`, { token }),
    resetPassword: (token, new_password) => axios.post(`${API}/auth/reset-password`, { token, new_password }),
    updateEmail: (newEmail) => axios.post(`${API}/auth/update-email`, { new_email: newEmail }, getAuthHeaders()),
    updatePassword: (currentPassword, newPassword) => axios.post(`${API}/auth/update-password`, { current_password: currentPassword, new_password: newPassword }, getAuthHeaders()),
    endPremium: () => axios.post(`${API}/auth/end-premium`, {}, getAuthHeaders()),
    // 2FA
    get2FAStatus: () => axios.get(`${API}/auth/2fa/status`, getAuthHeaders()),
    toggle2FA: (enable) => axios.post(`${API}/auth/2fa/toggle`, { enable }, getAuthHeaders()),
    request2FACode: (email) => axios.post(`${API}/auth/2fa/request-code?email=${encodeURIComponent(email)}`),
    verify2FACode: (email, code, password) => axios.post(`${API}/auth/2fa/verify`, { email, code, password }),
  },
  pregnancy: {
    calculate: (data) => axios.post(`${API}/pregnancy/calculate`, data, getAuthHeaders()),
    getProfile: () => axios.get(`${API}/pregnancy/profile`, getAuthHeaders()),
    toggleFertilityReminders: (enable) => axios.post(`${API}/pregnancy/fertility-reminders?enable=${enable}`, {}, getAuthHeaders()),
    getFertilityRemindersStatus: () => axios.get(`${API}/pregnancy/fertility-reminders`, getAuthHeaders()),
    checkFertilityWindow: () => axios.get(`${API}/pregnancy/check-fertility-window`, getAuthHeaders()),
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
  contact: {
    sendMessage: (data) => axios.post(`${API}/contact/send`, data, getAuthHeaders()),
    getMyMessages: () => axios.get(`${API}/contact/my-messages`, getAuthHeaders()),
    markReplyRead: (messageId) => axios.post(`${API}/contact/messages/${messageId}/mark-read`, {}, getAuthHeaders()),
    replyToConversation: (messageId, message, images = []) => axios.post(`${API}/contact/messages/${messageId}/reply`, { subject: '', message, images }, getAuthHeaders()),
    deleteMessage: (messageId) => axios.delete(`${API}/contact/messages/${messageId}`, getAuthHeaders()),
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
    // Scheduled reminders
    getScheduledReminders: () => axios.get(`${API}/medical/scheduled-reminders`, getAuthHeaders()),
    scheduleReminder: (appointmentId, reminderDatetime, reminderType = 'push') => 
      axios.post(`${API}/medical/schedule-reminder`, { 
        appointment_id: appointmentId, 
        reminder_datetime: reminderDatetime, 
        reminder_type: reminderType 
      }, getAuthHeaders()),
    deleteReminder: (appointmentId) => axios.delete(`${API}/medical/reminder/${appointmentId}`, getAuthHeaders()),
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
    getStatus: () => axios.get(`${API}/subscription-status`, getAuthHeaders()),
    redeemCode: (code) => axios.post(`${API}/redeem-code`, { code }, getAuthHeaders()),
    getFullStatus: () => axios.get(`${API}/subscription/full-status`, getAuthHeaders()),
    purchasePostpartum: () => axios.post(`${API}/subscription/purchase-postpartum`, {}, getAuthHeaders()),
    // Essai gratuit
    startTrial: () => axios.post(`${API}/payments/trial/start`, {}, getAuthHeaders()),
    getTrialStatus: () => axios.get(`${API}/payments/trial/status`, getAuthHeaders()),
  },
  referral: {
    getStatus: () => axios.get(`${API}/referral/status`, getAuthHeaders()),
    submit: (data) => axios.post(`${API}/referral/submit`, data, getAuthHeaders()),
    checkCompletion: () => axios.get(`${API}/referral/check-completion`, getAuthHeaders()),
  },
  postpartum: {
    getContent: () => axios.get(`${API}/postpartum/content`, getAuthHeaders()),
    getAppointments: () => axios.get(`${API}/postpartum/appointments`, getAuthHeaders()),
    getMaternityBag: () => axios.get(`${API}/maternity-bag`, getAuthHeaders()),
    toggleMaternityItem: (index, checked, isCustom) => 
      axios.post(`${API}/maternity-bag/check?item_index=${index}&checked=${checked}&is_custom=${isCustom}`, {}, getAuthHeaders()),
    suggestMaternityItem: (category, item) => 
      axios.post(`${API}/maternity-bag/suggest`, { category, item }, getAuthHeaders()),
    // New endpoints
    getStatus: () => axios.get(`${API}/postpartum/status`, getAuthHeaders()),
    setBirthDate: (birthDate, babyName) => 
      axios.post(`${API}/postpartum/set-birth-date`, { birth_date: birthDate, baby_name: babyName }, getAuthHeaders()),
    getPendingReminders: () => axios.get(`${API}/postpartum/pending-reminders`, getAuthHeaders()),
    sendDueReminders: () => axios.post(`${API}/postpartum/send-due-reminders`, {}, getAuthHeaders()),
    requestRefund: (reason, details) => 
      axios.post(`${API}/postpartum/request-refund`, { reason, details }, getAuthHeaders()),
    requestRefundWithDoc: (formData) => 
      axios.post(`${API}/postpartum/request-refund-with-doc`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }),
    // Account status & export
    getAccountStatus: () => axios.get(`${API}/postpartum/account-status`, getAuthHeaders()),
    exportData: () => axios.get(`${API}/postpartum/export-data`, getAuthHeaders()),
    archiveAccount: () => axios.post(`${API}/postpartum/archive-account`, {}, getAuthHeaders()),
    requestEarlyArchive: () => axios.post(`${API}/postpartum/request-early-archive`, {}, getAuthHeaders()),
    // Recipe favorites
    getFavorites: () => axios.get(`${API}/postpartum/favorites`, getAuthHeaders()),
    toggleFavorite: (recipeName) => axios.post(`${API}/postpartum/favorites/toggle`, { recipe_name: recipeName }, getAuthHeaders()),
    // Recipe sharing
    shareRecipes: (recipeNames) => axios.post(`${API}/postpartum/share-recipes`, { recipe_names: recipeNames }, getAuthHeaders()),
    getSharedRecipes: (shareCode) => axios.get(`${API}/postpartum/shared/${shareCode}`),
    getMyShares: () => axios.get(`${API}/postpartum/my-shares`, getAuthHeaders()),
    // Maternity bag favorites
    getMaternityBagFavorites: () => axios.get(`${API}/maternity-bag/favorites`, getAuthHeaders()),
    toggleMaternityBagFavorite: (itemName) => axios.post(`${API}/maternity-bag/favorites/toggle`, { item_name: itemName }, getAuthHeaders()),
  },
  admin: {
    generateCodes: (count, note) => axios.post(`${API}/admin/generate-codes?count=${count}&note=${encodeURIComponent(note)}`, {}, getAuthHeaders()),
    getCodes: () => axios.get(`${API}/admin/promo-codes`, getAuthHeaders()),
    getUsers: () => axios.get(`${API}/admin/users`, getAuthHeaders()),
    getStats: () => axios.get(`${API}/admin/stats`, getAuthHeaders()),
    getAdvancedStats: () => axios.get(`${API}/admin/advanced-stats`, getAuthHeaders()),
    getChartStats: () => axios.get(`${API}/admin/chart-stats`, getAuthHeaders()),
    getPendingFoods: () => axios.get(`${API}/admin/pending-foods`, getAuthHeaders()),
    updateFoodStatus: (foodId, status) => axios.post(`${API}/admin/food-status/${foodId}?status=${status}`, {}, getAuthHeaders()),
    getMessages: () => axios.get(`${API}/admin/messages`, getAuthHeaders()),
    markMessageRead: (messageId) => axios.post(`${API}/admin/messages/${messageId}/read`, {}, getAuthHeaders()),
    replyToMessage: (messageId, reply) => axios.post(`${API}/admin/messages/${messageId}/reply`, { reply }, getAuthHeaders()),
    deleteMessage: (messageId) => axios.delete(`${API}/admin/messages/${messageId}`, getAuthHeaders()),
    getRefundRequests: () => axios.get(`${API}/admin/refund-requests`, getAuthHeaders()),
    approveRefund: (userId, approved) => axios.post(`${API}/admin/refund-requests/${userId}/approve?approved=${approved}`, {}, getAuthHeaders()),
    getRefundDocument: (userId) => `${API}/admin/refund-document/${userId}`,
    setUserPremium: (userId, premium) => axios.post(`${API}/admin/user/${userId}/set-premium?premium=${premium}`, {}, getAuthHeaders()),
    setUserPostpartum: (userId, enabled) => axios.post(`${API}/admin/user/${userId}/set-postpartum?enabled=${enabled}`, {}, getAuthHeaders()),
    setUserRole: (userId, role) => axios.post(`${API}/admin/user/${userId}/set-role?role=${role}`, getAuthHeaders()),
    // Reminders Dashboard
    getRemindersDashboard: () => axios.get(`${API}/admin/reminders/dashboard`, getAuthHeaders()),
    getAllReminders: (status = 'all') => axios.get(`${API}/admin/reminders/all?status=${status}`, getAuthHeaders()),
    getRemindersHistory: (limit = 100) => axios.get(`${API}/admin/reminders/history?limit=${limit}`, getAuthHeaders()),
    sendDueReminders: () => axios.post(`${API}/admin/reminders/send-now`, {}, getAuthHeaders()),
    deleteReminder: (reminderId) => axios.delete(`${API}/admin/reminders/${reminderId}`, getAuthHeaders()),
    exportRemindersCSV: (includeHistory = true) => `${API}/admin/reminders/export-csv?include_history=${includeHistory}`,
    getSchedulerAlerts: () => axios.get(`${API}/admin/scheduler/alerts`, getAuthHeaders()),
    testSchedulerAlert: () => axios.post(`${API}/admin/scheduler/test-alert`, {}, getAuthHeaders()),
    // Android Export
    getAndroidInfo: () => axios.get(`${API}/admin/android/info`, getAuthHeaders()),
    downloadAndroidProject: () => `${API}/admin/android/download`,
    sendAndroidEmail: () => axios.post(`${API}/admin/android/send-email`, {}, getAuthHeaders()),
    // Business Kit
    getBusinessKitInfo: () => axios.get(`${API}/admin/business-kit/info`, getAuthHeaders()),
    sendBusinessKitEmail: () => axios.post(`${API}/admin/business-kit/send-email`, {}, getAuthHeaders()),
    // News Notifications
    sendNewsNotification: (data) => axios.post(`${API}/admin/send-news-notification`, data, getAuthHeaders()),
    getNewsNotifications: () => axios.get(`${API}/admin/news-notifications`, getAuthHeaders()),
    // Changelog
    getChangelog: () => axios.get(`${API}/admin/changelog`, getAuthHeaders()),
    markFeatureNotified: (featureId) => axios.post(`${API}/admin/changelog/mark-notified/${featureId}`, {}, getAuthHeaders()),
    addChangelogFeature: (data) => axios.post(`${API}/admin/changelog/add`, data, getAuthHeaders()),
  },
  
  chatbot: {
    sendMessage: (message, sessionId = null) => axios.post(`${API}/chatbot/message`, { message, session_id: sessionId }, getAuthHeaders()),
    getHistory: (sessionId = null) => axios.get(`${API}/chatbot/history${sessionId ? `?session_id=${sessionId}` : ''}`, getAuthHeaders()),
    deleteSession: (sessionId) => axios.delete(`${API}/chatbot/session/${sessionId}`, getAuthHeaders()),
    getSuggestions: () => axios.get(`${API}/chatbot/suggestions`),
  },
  
  favorites: {
    get: () => axios.get(`${API}/babynames-favorites`, getAuthHeaders()),
    sync: (favorites) => axios.post(`${API}/babynames-favorites`, { favorites }, getAuthHeaders()),
    merge: (favorites) => axios.post(`${API}/babynames-favorites/merge`, { favorites }, getAuthHeaders()),
    clear: () => axios.delete(`${API}/babynames-favorites`, getAuthHeaders()),
  },
  
  nameStats: {
    trackView: (name, country, gender) => axios.post(`${API}/babynames-stats/view`, { name, country, gender }),
    getTop: (limit = 10) => axios.get(`${API}/babynames-stats/top?limit=${limit}`),
    getTrending: (days = 7, limit = 5) => axios.get(`${API}/babynames-stats/trending?days=${days}&limit=${limit}`),
  },
};

export default api;
