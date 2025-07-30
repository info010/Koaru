import { Client, GatewayIntentBits, Partials, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const CHANNELS = {
  episodes: process.env.DISCORD_EPISODE_CHANNEL_ID,   // Yeni bölümler için
  animes: process.env.DISCORD_ANIME_CHANNEL_ID // Yeni anime başlangıçları için
};

async function startDiscordBot() {
  await client.login(process.env.DISCORD_TOKEN);
  return new Promise(resolve => {
    client.once('ready', () => {
      console.log(`Discord bot hazır! Giriş yapan: ${client.user.tag}`);
      resolve();
    });
  });
}

async function sendEmbed(channelId, embed) {
  const channel = await client.channels.fetch(channelId);
  if (!channel) throw new Error(`Kanal bulunamadı: ${channelId}`);
  return await channel.send({ embeds: [embed] });
}

async function sendMessage(channelId, content) {
  const channel = await client.channels.fetch(channelId);
  if (!channel) throw new Error(`Kanal bulunamadı: ${channelId}`);
  return await channel.send(content);
}

async function sendDM(userId, content) {
  const user = await client.users.fetch(userId);
  if (!user) throw new Error(`Kullanıcı bulunamadı: ${userId}`);
  return await user.send(content);
}

export {
  client,
  startDiscordBot,
  sendEmbed,
  sendMessage,
  sendDM,
  CHANNELS
};
