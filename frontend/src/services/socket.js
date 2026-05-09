import { io } from 'socket.io-client';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const socket = io(import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000' : 'https://sessbee-backend.onrender.com'));

export default socket;
