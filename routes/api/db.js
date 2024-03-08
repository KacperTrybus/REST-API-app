// const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const uri = process.env.DB_URL;

const mongoose = require("mongoose");
const options = {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

async function run() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "db-contacts",

      ...options,
    });
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}
run().catch(console.dir);

module.exports = {
  run,
};
