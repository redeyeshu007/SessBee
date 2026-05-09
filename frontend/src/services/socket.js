import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`);

export default socket;
