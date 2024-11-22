import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:6777/'
      : 'https://ocserver.failean.com/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  auth: {
    username: 'client',
    password: process.env.OCPASS + 'xx',
  },
});

export { axiosInstance };
