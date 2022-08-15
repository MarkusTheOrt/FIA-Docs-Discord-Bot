import { Collection, Db, MongoClient } from "mongodb";

import { Option, some, none, unwrap } from "./Option.js";
import { dbDocument, dbEvent, dbGuild, dbThread } from "./Types.js";
import Config from "../config.js";
import Log from "./Log.js";

class Database {
  private client: MongoClient;
  private db: Db;
  private guilds: Option<Collection<dbGuild>> = none;
  private documents: Option<Collection<dbDocument>> = none;
  private events: Option<Collection<dbEvent>> = none;
  private threads: Option<Collection<dbThread>> = none;

  constructor() {
    this.client = new MongoClient(unwrap(Config.mongoConnection));
    this.db = this.client.db(Config.dbName);
  }

  async connect() {
    try {
      await this.client.connect();
    } catch (error) {
      throw new Error("Couldn't Connect to Database");
    }

    Log.Info("Database Connected.");
    this.guilds = some(this.db.collection("guilds"));
    this.documents = some(this.db.collection("documents"));
    this.events = some(this.db.collection("events"));
    this.threads = some(this.db.collection("threads"));
  }

  get Guilds() {
    return unwrap(this.guilds);
  }

  get Documents() {
    return unwrap(this.documents);
  }

  get Events() {
    return unwrap(this.events);
  }

  get Threads() {
    return unwrap(this.threads);
  }
}

export default new Database();
