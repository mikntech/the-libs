import mongoose, { ConnectOptions } from 'mongoose';

export let safeDB: mongoose.Connection | null = null;

const mongoSetup = async () => {
  safeDB = mongoose.createConnection(process.env.MONGO + '', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);

  safeDB.on('error', 
  safeDB.once('open', function () {
    // we're connected!
  });
};

export default mongoSetup;
