import pidusage from 'pidusage';
import os from 'os';
import fs from 'fs/promises';
import { EmbedBuilder } from 'discord.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Proje kökündeki data.db'yi hedefle
const DB_PATH = path.join(__dirname, '../../../data.db');


export async function execute(interaction) {
  const pid = process.pid;

  // pidusage ile CPU ve memory al
  let usage;
  try {
    usage = await pidusage(pid);
    console.log(`CPU: ${usage.cpu.toFixed(1)}%, Memory: ${(usage.memory / 1024 / 1024).toFixed(2)} MB`);
  } catch {
    usage = { cpu: 0, memory: 0, elapsed: 0 };
  }

  const memoryUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const uptime = process.uptime();

  const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);
  const formatPercent = (used, total) => `${((used / total) * 100).toFixed(1)}%`;

  // DB boyutu
  let dbSizeMB = 'N/A';
  try {
    const stats = await fs.stat(DB_PATH);
    dbSizeMB = formatMB(stats.size);
  } catch {
    dbSizeMB = 'Veritabanı bulunamadı';
  }

  const embed = new EmbedBuilder()
    .setTitle('📊 Bot Sistem Durumu')
    .setColor(0x0099ff)
    .addFields(
      { name: '📡 Ping', value: `\`${interaction.client.ws.ping}ms\``, inline: true },
      { name: '⏱️ Uptime', value: `\`${Math.floor(uptime)} sn\``, inline: true },
      { name: '💾 Veritabanı Boyutu', value: `\`${dbSizeMB} MB\``, inline: true },
      {
        name: '🧠 Bellek Kullanımı (pidusage)',
        value: `\`${formatMB(usage.memory)} MB\` (${usage.memory ? formatPercent(usage.memory, totalMem) : '0.0%'} CPU)`,
        inline: true
      },
      {
        name: '⚙️ CPU Kullanımı',
        value: `\`${usage.cpu ? usage.cpu.toFixed(1) : 0}%\``,
        inline: true
      },
      {
        name: '🧩 Diğer Bellek Detayları (process.memoryUsage())',
        value: `
• RSS: \`${formatMB(memoryUsage.rss)} MB\`
• Heap Total: \`${formatMB(memoryUsage.heapTotal)} MB\`
• Heap Used: \`${formatMB(memoryUsage.heapUsed)} MB\`
• External: \`${formatMB(memoryUsage.external)} MB\`
        `.trim(),
        inline: false
      }
    )
    .setTimestamp();
  

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
