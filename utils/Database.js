const { MongoClient } = require("mongodb");
const config = require("../config.json");
const Log = require("./Log");

class Database {
  #client = null;
  #db = null;
  guilds = null;
  documents = null;

  constructor() {
    this.#client = new MongoClient(config.mongoConnection);
  }

  async connect() {
    await this.#client.connect();
    Log.Info("Database Connected.");
    this.#db = this.#client.db(config.dbName);
    this.guilds = this.#db.collection("guilds");
    this.documents = this.#db.collection("documents");
  }
}

module.exports = new Database();
