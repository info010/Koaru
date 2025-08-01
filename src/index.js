import { client } from "./discord/bot.js";
import { checkNewChapters } from "./services/chapterService.js";
import { checkNewAnimes, setupReactionListeners } from "./services/animeService.js";

const TIME_INTERVAL =  10 * 10 * 1000; // 10 dakika

client.once("ready", async () => {
  console.log(`Discord bot hazır! Giriş yapan: ${client.user.tag}`);

  setupReactionListeners();

  // await checkNewAnimes();
  await checkNewChapters();
  await checkNewAnimes();
  // 10 dakikada bir kontrol
  setInterval(async () => {
    console.log("-----------------" + new Date().toLocaleTimeString() + "-----------------");
    await checkNewAnimes();
    await checkNewChapters();
    console.log("-----------------" + new Date().toLocaleTimeString() + "-----------------");
  }, TIME_INTERVAL);
});

client.login(process.env.DISCORD_TOKEN);
