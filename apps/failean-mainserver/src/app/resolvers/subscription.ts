import pubsub from '../setup/redisSetup';

const Subscription = {
  jobCompleted: {
    subscribe: () => {
      return pubsub.asyncIterator('JOB_COMPLETED');
    },
  },
};

export default Subscription;
