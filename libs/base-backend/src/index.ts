
export *  from './config';
export * from './controllers';
export * from './exceptions';
export * from './schemas';
export * from './services';
export * from './types';



import { setup } from './services';
import { connect } from './schemas';
import { Router } from 'express';
import { settings } from './config';



export const start = (apiRouter= Router(), watchDB =()=>{}) => {
  console.log('Connecting to MongoDB...');
  connect(settings.mongoURI,settings.stagingEnv,watchDB)
    .then(() => setup(apiRouter).catch((e) => console.log(e)))
    .catch((e) => console.log(e));
};
