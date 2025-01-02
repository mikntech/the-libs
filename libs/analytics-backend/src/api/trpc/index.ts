import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import { createDoc } from '@the-libs/mongo-backend';
import { analyticEvent } from '@the-libs/analytics-backend';
import { SomeEnum } from '@the-libs/base-shared';
import { createHTTPServer } from '@trpc/server/adapters/standalone';

const t = initTRPC.create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const initApi = <ENUM>(AnalyticEventEnum: SomeEnum<ENUM>) => {
  const api = router({
    addTestToQueue: publicProcedure
      .input(
        z.object({ value: z.string(), userNumber: z.optional(z.string()) }),
      )
      .mutation(async ({ input }) => {
        try {
          await createDoc(await analyticEvent<ENUM>(AnalyticEventEnum), {
            value: input.value,
            userNumber: input.userNumber,
          });
        } catch (e) {
          console.log(e);
        }
        return { statusCode: 201, body: 'got it' };
      }),
  });

  const server = createHTTPServer({
    router: api,
  });

  const PORT = 3003;

  server.listen(PORT);
};
