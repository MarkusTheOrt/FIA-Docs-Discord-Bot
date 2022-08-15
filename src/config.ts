import { some, none } from "./utils/Option.js";

export default {
  botToken: process.env.BOTTOKEN ? some(process.env.BOTTOKEN) : none,
  mongoConnection: process.env.MONGO ? some(process.env.MONGO) : none,
  dbName: process.env.DB || "fia",
  fetchInterval: process.env.FETCH || 60,
  botPerms: process.env.PERMS || 34359756800,
  imgUrl: process.env.IMG || "https://fia.ort.dev/",
  discordAppId: process.env.DAI || "916288992452964374",
};
