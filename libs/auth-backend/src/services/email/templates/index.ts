import { GenEmailFunction } from 'base-backend';

export const defaultGenRegisterEmail: GenEmailFunction = (url: string) => ({
  subject: 'verify your email to complete registration',
  body: url,
});

export const defaultGenPassResetEmail: GenEmailFunction = (url: string) => ({
  subject: 'verify your email to complete pass reset',
  body: url,
});