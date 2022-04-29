module.exports = {
  botToken: process.env.BOTTOKEN,
  mongoConnection: process.env.MONGO,
  dbName: process.env.DB || "fia",
  fetchInterval: process.env.FETCH || 60,
  botPerms: process.env.PERMS || 34359756800,
  imgUrl: process.env.IMG || "https://fia.ort.dev/",
  discordAppId: process.env.DAI || "916288992452964374"
};
