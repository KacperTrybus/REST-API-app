const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const uri = process.env.DB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    await client.db("db-contacts").command({ ping: 1 });
    console.log("Database connection succesful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

module.exports = {
  run,
};
