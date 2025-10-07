const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useUnifiedTopology: true,
});

const dbName = "footprintloggerdb";

let db;

async function connectDB() {
  try {
    await client.connect();

    db = client.db(dbName);

    console.log("Connected to MongoDB ");

    client.on("close", () => console.log("MongoDB connection closed"));
    client.on("error", (err) =>
      console.error("MongoDB connection error:", err)
    );

    return db;
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

module.exports = { connectDB, client, db };
