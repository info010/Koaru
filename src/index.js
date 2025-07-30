import { client } from "./discord/bot.js";
import { checkNewChapters } from "./services/chapterService.js";
import { checkNewAnimes, setupReactionListeners } from "./services/animeService.js";

const TIME_INTERVAL = 10 * 60 * 1000; // 10 dakika

client.once("ready", async () => {
  console.log(`Discord bot hazır! Giriş yapan: ${client.user.tag}`);

  setupReactionListeners();

  // 10 dakikada bir kontrol
  setInterval(async () => {
    console.log("Yeni çıkan animeler kontrol ediliyor...");
    await checkNewAnimes();
    await checkNewChapters();
  }, TIME_INTERVAL);

  // İlk çalıştırmada da kontrol et
  await checkNewAnimes();
  await checkNewChapters();
});

client.login(process.env.DISCORD_TOKEN);
