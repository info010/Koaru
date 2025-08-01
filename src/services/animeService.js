import db from "../db/sqlite.js";
import { sendEmbed, sendDM, client, CHANNELS } from "../discord/bot.js";
import { fetchRecentAnimes } from "./anilistService.js";

const FOLLOW_EMOJI = "👀";

export async function checkNewAnimes() {
  console.log("Yeni animeler kontrol ediliyor...");
  const animes = await fetchRecentAnimes();

  const existingAnimes = db.prepare("SELECT mediaId, title FROM animes").all();

  // existingAnimes'i bir Set'e dönüştür
  const existingAnimesSet = new Set(existingAnimes.map(anime => anime.mediaId));

  for (const anime of animes) {
    if (!existingAnimesSet.has(anime.id)) {
      const title = anime.title.english || anime.title.romaji;
      console.log(`Yeni anime bulundu: ${title} (${anime.id})`);
      const startDateStr = anime.startDate
        ? `${anime.startDate.day || "??"}/${anime.startDate.month || "??"}/${
            anime.startDate.year || "????"
          }`
        : "Tarih bilgisi yok";

      const embed = {
        title: `📢 Yeni Anime Başladı: ${title}`,
        description: `İlk bölüm yayınlandı!\n\n[Anime Sayfası](${anime.siteUrl})\nBaşlangıç Tarihi: **${startDateStr}**`,
        color: 0x5865f2,
        timestamp: new Date(),
        image: {
          url: anime.coverImage?.large || anime.coverImage?.medium,
        },
        footer: { text: "Anime başlangıç bildirimi" },
      };

      // Embed gönder
      const message = await sendEmbed(CHANNELS.animes, embed);

      await message.react(FOLLOW_EMOJI);

      // Veritabanına ekle
      db.prepare(
        `
        INSERT INTO animes (mediaId, title, siteUrl, coverImage, firstNotifiedAt)
        VALUES (?, ?, ?, ?, strftime('%s', 'now'))
      `
      ).run(
        anime.id,
        title,
        anime.siteUrl,
        anime.coverImage?.large || anime.coverImage?.medium
      );
    }
  }
}

export function setupReactionListeners() {
  client.on("messageReactionAdd", async (reaction, user) => {
    if (user.bot) return;
    await handleReaction(reaction, user, true);
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    if (user.bot) return;
    await handleReaction(reaction, user, false);
  });
}

async function handleReaction(reaction, user, added) {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  if (reaction.emoji.name !== FOLLOW_EMOJI) return;
  if (reaction.message.channel.id !== CHANNELS.animes) return;

  const embed = reaction.message.embeds[0];
  if (!embed) return;

  const titleMatch = embed.title.match(/Yeni Anime Başladı: (.+)/);
  if (!titleMatch) return;

  const animeTitle = titleMatch[1];

  const anime = db
    .prepare("SELECT mediaId FROM animes WHERE title = ?")
    .get(animeTitle);
  if (!anime) return;

  if (added) {
    db.prepare(
      "INSERT OR IGNORE INTO user_follows (userId, mediaId) VALUES (?, ?)"
    ).run(user.id, anime.mediaId);
    console.log(`${user.tag} animeyi takip etmeye başladı: ${animeTitle}`);

    try {
      await sendDM(
        user,
        `✅ **${animeTitle}** animesini takip etmeye başladınız! Yeni bölümler size bildirilecektir.`
      );
    } catch (err) {
      console.error(`DM gönderilemedi: ${err}`);
    }
  } else {
    db.prepare("DELETE FROM user_follows WHERE userId = ? AND mediaId = ?").run(
      user.id,
      anime.mediaId
    );
    console.log(`${user.tag} animeyi takipten çıktı: ${animeTitle}`);

    try {
      await sendDM(
        user,
        `❌ **${animeTitle}** animesini takipten çıktınız. Artık yeni bölümler için bildirim almayacaksınız.`
      );
    } catch (err) {
      console.error(`DM gönderilemedi: ${err}`);
    }
  }
}