const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://kacpertrybus133:123123123@cluster0.rdi4yxt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    await client.db("admin").command({ ping: 1 });
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
