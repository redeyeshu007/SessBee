import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'https://sessbee-backend.onrender.com');

export default socket;
