import axios from 'axios';

const API = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:5000`,
});

API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
