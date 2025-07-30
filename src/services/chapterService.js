import db from "../db/sqlite.js";
import { sendEmbed, client, CHANNELS } from "../discord/bot.js";
import { fetchRecentEpisodes } from "./anilistService.js";

async function checkNewChapters() {
  const episodes = await fetchRecentEpisodes();

  for (const ep of episodes) {
    // Bölüm zaten bildirilmiş mi kontrol et
    const exists = db
      .prepare(
        "SELECT 1 FROM chapters WHERE mediaId = ? AND episode = ?"
      )
      .get(ep.media.id, ep.episode);

    if (!exists) {
      const title = ep.media.title.english || ep.media.title.romaji;

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
        }
      }
    }
  }
}

export { checkNewChapters };
