export type GenEmailFunction = (...args: any[]) => {
  subject: string;
  body: string;
};
