import dotenv from 'dotenv';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { useServer } from 'graphql-ws/lib/use/ws';
import { Server } from 'ws';
import { apolloServer, schema } from './app/setup/graphqlSetup';
import { app, port } from './app/setup/expressSetup';
import mongoSetup from './app/setup/mongoSetup';
import scheduleAll from './app/scheduled/scheduleder';
import { PromptName, WhiteModels } from '@failean/shared-types';
import * as process from 'process';

dotenv.config();

process.env.NODE_ENV !== 'development' && require('newrelic');

const connectApolloServer = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  const httpServer = createServer(app);
  const wsServer = new Server({
    server: httpServer,
    path: '/graphql',
  });

  useServer(
    {
      schema,
      execute,
      subscribe,
      onConnect: () => {
        
      },
      onSubscribe: () => {
        
      },
    },
    wsServer,
  );

  httpServer.listen(port, '0.0.0.0', () => {
    /*
                `Server is ready at http://127.0.0.1:${port}${apolloServer.graphqlPath}`
            );
            
  });
};

const setup = async () => {
  try {
    await connectApolloServer();
  } catch (error) {
    // 
  }
};

mongoSetup().then(() => {
  setup();
});

setTimeout(() => scheduleAll(), 600000);
