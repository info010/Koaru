import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName('stats')
    .setDefaultMemberPermissions(0) // Sadece bot sahibi kullanabilir
    .setDescription('Botun CPU, RAM ve sistem bilgilerini gösterir.')
    .toJSON(),
  new SlashCommandBuilder()
    .setName('role')
    .setDescription('Emoji ile rol alma mesajı gönderir')
    .setDefaultMemberPermissions(0)
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('🔄 Slash komutları Discord API\'ye yükleniyor...');

  await rest.put(
    Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID ,process.env.DISCORD_GUILD_ID),
    { body: commands }
  );

  console.log('✅ Slash komutları başarıyla yüklendi.');
} catch (error) {
  console.error('🚨 Slash komutu yükleme hatası:', error);
}
