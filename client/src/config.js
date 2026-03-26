import { Capacitor } from '@capacitor/core';
export const API_BASE_URL = Capacitor.isNativePlatform() ? 'http://10.72.1.1:5000/api' : '/api';
