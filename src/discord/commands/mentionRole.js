import { EmbedBuilder } from 'discord.js';
import { client, sendEmbed } from '../bot.js';

const MESSAGE_ID = "1400901676260393133";

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('🎭 Rol Alma')
    .setDescription(`Bu mesajdaki ✅ emojisine tıklayarak rol alabilir veya tekrar kaldırarak rolü bırakabilirsiniz.`)
    .setColor(0x00AE86);

  const message = await sendEmbed(interaction.channelId, embed);

  // Mesajı emoji ile işaretle
  await message.react("✅");
}

export function setupRoleReactionListener() {
  client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    await handleRoleReaction(reaction, user, true);
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    await handleRoleReaction(reaction, user, false);
  });
}

async function handleRoleReaction(reaction, user, added) {
  try {
    // console.log(`Rol ${added ? 'verildi' : 'geri alındı'}: ${user.tag} - ${reaction.emoji.name}`);
    if (reaction.partial) await reaction.fetch();
    // console.log(`Reaction ID: ${reaction.message.id}, Emoji: ${reaction.emoji.name}`);
    if (reaction.message.partial) await reaction.message.fetch();
    // console.log(`Message ID: ${reaction.message.id}, Content: ${reaction.message.content}`);

    if (
      reaction.message.id !== MESSAGE_ID ||
      reaction.emoji.name !== "✅"
    ) return;

    // console.log(`Rol alma mesajı kontrol edildi: ${reaction.message.id}`);

    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get("1400891301599248536");

    if (!role) return;

    // console.log(`Rol bulundu: ${role.name} (${role.id})`);

    if (added) {
      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role);
        console.log(`${user.tag} rol verildi: ${role.name}`);
      }
    } else {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        console.log(`${user.tag} rol geri alındı: ${role.name}`);
      }
    }
  } catch (err) {
    console.error("Rol atama/çıkarma hatası:", err);
  }
}