import mongoose, { ConnectOptions } from "mongoose";

export let safeDB: mongoose.Connection | null = null;

const mongoSetup = async () => {
  console.log("Trying to connect safemain mongodb...");



  safeDB =  mongoose.createConnection(
    process.env.MONGO+"",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions
  );

  safeDB.on("error", console.error.bind(console, "connection error:"));
  safeDB.once("open", function () {
    // we're connected!
    console.log("safe main DB connected successfully");
  });
};

export default mongoSetup;
