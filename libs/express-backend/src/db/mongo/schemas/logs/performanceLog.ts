import { getModel } from '@the-libs/mongo-backend';
import { PerformanceLog } from '@the-libs/base-shared';

export const performanceLog = () =>
  getModel<
    PerformanceLog,
    {
      timeTook: number;
      urlWithoutQuery: string;
      query: object;
      didTakeMoreThan1Sec: boolean;
      didTakeMoreThan5Sec: boolean;
      didTakeMoreThan15Sec: boolean;
    }
  >(
    'performanceLog',
    {
      stringifiedLog: {
        type: String,
      },
    },
    {
      computedFields: {
        didTakeMoreThan1Sec: {
          compute: async ({ stringifiedLog }) => {
            const { start, end } = JSON.parse(stringifiedLog);
            return end - start > 1000;
          },
          invalidate: async (id, _, { _id }) => id === String(_id),
        },
        didTakeMoreThan5Sec: {
          compute: async ({ stringifiedLog }) => {
            const { start, end } = JSON.parse(stringifiedLog);
            return end - start > 5000;
          },
          invalidate: async (id, _, { _id }) => id === String(_id),
        },
        didTakeMoreThan15Sec: {
          compute: async ({ stringifiedLog }) => {
            const { start, end } = JSON.parse(stringifiedLog);
            return end - start > 15000;
          },
          invalidate: async (id, _, { _id }) => id === String(_id),
        },
        timeTook: {
          compute: async ({ stringifiedLog }) => {
            const { start, end } = JSON.parse(stringifiedLog);
            return end - start;
          },
          invalidate: async (id, _, { _id }) => id === String(_id),
        },
        urlWithoutQuery: {
          compute: async ({ stringifiedLog }) => {
            const { originalUrl } = JSON.parse(stringifiedLog);
            return originalUrl.split('?')[0];
          },
          invalidate: async (id, _, { _id }) => id === String(_id),
        },
        query: {
          compute: async ({ stringifiedLog }) => {
            const { originalUrl } = JSON.parse(stringifiedLog);
            const queryString = originalUrl.split('?')[1];
            const params: string[] = queryString.split('&');
            return params.reduce((acc: any, next) => {
              const [key, value] = next.split('=');
              acc[key] = value;
              return acc;
            }, {});
          },
          invalidate: async (id, _, { _id }) => id === String(_id),
        },
      },
    },
  );
