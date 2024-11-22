import dotenv from 'dotenv';
dotenv.config();

export const ocClientDomain =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5998'
    : 'https://oc.failean.com';

export const clientDomain =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:5999'
    : 'https://failean.com';
