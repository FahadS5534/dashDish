export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? '/api/v1'
    : 'https://dashdish-backend-api.onrender.com/api/v1'
};
