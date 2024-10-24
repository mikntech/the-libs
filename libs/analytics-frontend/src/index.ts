import axios from 'axios';

export const logEvent = <AnalyticEvent>(
  value: AnalyticEvent,
  analyticsEndpoint: string,
  userNumber: string = 'unknown yet',
) =>
  axios.post(analyticsEndpoint, {
    value,
    userNumber,
  });
