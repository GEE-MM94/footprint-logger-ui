const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true,
});

async function connectDB() {
  try {
    if (!client.topology?.isConnected?.()) {
      await client.connect();
    }

    const db = client.db(dbName);

    client.once("close", () => console.log("MongoDB connection closed"));
    client.once("error", (err) =>
      console.error("MongoDB connection error:", err)
    );

    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

module.exports = { connectDB, client };
