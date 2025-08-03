import db from "../db/sqlite.js";
import { sendEmbed, client, CHANNELS, sendMessage } from "../discord/bot.js";
import { fetchRecentEpisodes } from "./anilistService.js";

export async function checkNewChapters() {
  console.log("Yeni bölümler kontrol ediliyor...");
  const episodes = await fetchRecentEpisodes();

  const existingChapters = db.prepare("SELECT mediaId, episode FROM chapters").all();

  const existingChaptersSet = new Set(
    existingChapters.map(chapter => `${chapter.mediaId}-${chapter.episode}`)
  );

  for (const ep of episodes) {

    if (!existingChaptersSet.has(`${ep.media.id}-${ep.episode}`)) {
      console.log(`Yeni bölüm bulundu: ${ep.media.title.english} - Bölüm ${ep.episode}`);
      const title = ep.media.title.english || ep.media.title.romaji;
      
      if (!title == "Nukitashi THE ANIMATION") continue; // Özel durum: Nukitashi THE ANIMATION'ı atla
      // Bölüm bildirimi embedi
      const embed = {
        title: `🎬 Yeni Bölüm: ${title} - Bölüm ${ep.episode}`,
        description: `Yayın Tarihi: **${new Date(
          ep.airingAt * 1000
        ).toLocaleString()}**\n\n[Anime Sayfası](${ep.media.siteUrl})`,
        color: 0x5865f2,
        timestamp: new Date(ep.airingAt * 1000),
        image: { url: ep.media.coverImage?.large || ep.media.coverImage?.medium },
      };

      // Ana kanala gönder
      await sendMessage(CHANNELS.episodes, "<@&1400891301599248536>")
      await sendEmbed(CHANNELS.episodes, embed);

      // DB'ye kaydet
      db.prepare(
        `
        INSERT INTO chapters (mediaId, episode, notifiedAt)
        VALUES (?, ?, strftime('%s', 'now'))
      `
      ).run(ep.media.id, ep.episode);

      // O animeleri takip edenlere DM gönder
      const followers = db
        .prepare("SELECT userId FROM user_follows WHERE mediaId = ?")
        .all(ep.media.id);

        /*
      for (const follower of followers) {
        try {
          const user = await client.users.fetch(follower.userId);
          if (user) {
            await user.send({
              embeds: [embed],
            });
          }
        } catch (error) {
          console.warn(`DM gönderilemedi: ${follower.userId}`, error);
          continue;
        }
      }*/
    }
  }
}
