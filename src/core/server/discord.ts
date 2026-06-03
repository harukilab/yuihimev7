import { Client, GatewayIntentBits, ChannelType, Message } from "discord.js";
import { Kernel } from "../kernel/core.js";
import { MultiChannelQueue } from "../kernel/MultiChannelQueue.js";
import { initializeDatabase } from "../database.js";

let db: any = null;
export let activeDiscordClient: Client | null = null;
export let activeDiscordToken: string | null = null;

export async function initializeDiscord(activeDb?: any, force = false) {
  if (activeDb) {
    db = activeDb;
  } else if (!db) {
    db = initializeDatabase();
  }

  const settings = Kernel.getInstance().getSettings().getAll();
  const botToken = settings['discord_bridge']?.botToken || process.env.DISCORD_BOT_TOKEN;
  const isEnabled = settings['discord_bridge']?.enabled !== false;

  if (!botToken || !isEnabled) {
    if (activeDiscordClient) {
      console.log("[DISCORD] Discord Client dinonaktifkan atau Token kosong. Menghentikan Discord Daemon...");
      try {
        activeDiscordClient.destroy();
      } catch (e) {}
      activeDiscordClient = null;
      activeDiscordToken = null;
    }
    if (!botToken) {
      console.warn("[KERNEL] Discord Bot Token tidak ditemukan di config.toml atau pengaturan UI. Discord dinonaktifkan.");
    } else {
      console.log("[KERNEL] Discord Bot dinonaktifkan melalui konfigurasi.");
    }
    return;
  }

  if (activeDiscordClient && activeDiscordToken === botToken && !force) {
    console.log("[DISCORD] Discord Client sudah aktif dengan token yang sesuai. Melewati inisialisasi.");
    return;
  }

  if (activeDiscordClient) {
    console.log("[DISCORD] Menghentikan instansi Discord Client lama demi penyegaran...");
    try {
      activeDiscordClient.destroy();
    } catch (e) {}
    activeDiscordClient = null;
  }

  console.log("[DISCORD] Menginisiasi Discord Client dengan Gateway Intents...");
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.once("ready", () => {
    console.log(`[DISCORD] Sukses terhubung! Bermain sebagai: ${client.user?.tag}`);
  });

  client.on("messageCreate", async (message: Message) => {
    // Abaikan pesan dari bot sendiri atau bot lain untuk menghindari kognisi tanpa akhir
    if (message.author.bot) return;

    const currentSettings = Kernel.getInstance().getSettings().getAll();
    const userMessage = message.content;
    const senderName = message.author.displayName || message.author.username;
    
    // Tentukan apakah pesan ini ditujukan untuk Yui
    const isDM = message.channel.type === ChannelType.DM;
    const isMentioned = client.user ? message.mentions.has(client.user) : false;
    
    // Kita tangkap jika direct message, bot dimention, atau jika channel dikonfigurasi sebagai tempat Yui mengobrol
    const targetChannelId = currentSettings['discord_bridge']?.voiceChannelId || currentSettings['discord_bridge']?.guildId;
    const matchesTargetChannel = targetChannelId ? message.channel.id === targetChannelId : false;

    // Yui merespons jika: DM, dimention, atau berada di channel target
    if (!isDM && !isMentioned && !matchesTargetChannel) {
      return; 
    }

    // Acknowledge typing indicator
    if (currentSettings['discord_bridge']?.autoAcknowledge !== false) {
      try {
        if (typeof (message.channel as any).sendTyping === 'function') {
          await (message.channel as any).sendTyping();
        }
      } catch (e) {}
    }

    try {
      const isServerText = message.guild ? true : false;
      const contextId = `dc_${message.channel.id}`;
      const chatType = `Discord (${isServerText ? 'Guild: ' + message.guild?.name : 'DM'})`;

      // Bersihkan text dari mention tag Yui agar input bersih
      let cleanedInput = userMessage;
      if (client.user && isMentioned) {
        cleanedInput = userMessage.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
      }

      // 1. Broadcast pesan masuk dari Discord ke Web UI via WebSockets
      const { broadcastToWS } = await import("./apiRouter.js");
      broadcastToWS({
        type: "remote_message_received",
        data: {
          senderName,
          message: cleanedInput,
          channel: chatType,
          contextId
        }
      });

      // 2. Tambahkan ke Antrean Multi-Saluran (MultiChannelQueue)
      MultiChannelQueue.getInstance().addMessage(
        cleanedInput,
        senderName,
        contextId,
        chatType,
        async (response) => {
          if (response) {
            await message.reply(response).catch(() => {});
            
            // 3. Broadcast ucapan Yui ke Web UI via WebSockets
            broadcastToWS({
              type: "remote_response_sent",
              data: {
                reply: response,
                channel: chatType,
                contextId
              }
            });
          }
        },
        async (err) => {
          console.error("[DISCORD_QUEUE] Gagal memproses pesan Discord:", err);
          try {
            await message.reply("[SYSTEM ERROR] Sambungan saraf kognitif Yui terputus sementara.");
          } catch (e) {}
        }
      );
    } catch (err: any) {
      console.error("[DISCORD_ERROR] Terjadi kesalahan dalam pemrosesan pesan:", err);
    }
  });

  client.on("error", (error) => {
    console.error("[DISCORD_CLIENT_ERROR] Terjadi kegagalan koneksi di Discord client:", error);
  });

  try {
    await client.login(botToken);
    activeDiscordClient = client;
    activeDiscordToken = botToken;
  } catch (err: any) {
    console.error(`[DISCORD] Gagal melakukan login dengan token: ${err.message || err}`);
  }
}
