const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

bot.once('ready', () => {
    console.log(`[Discord] ${bot.user.tag} is online!`);
});

const login = () => {
    if (!process.env.DISCORD_TOKEN) {
        console.error('DISCORD_TOKEN is missing in .env');
        process.exit(1);
    }
    return bot.login(process.env.DISCORD_TOKEN);
};

const getChannel = async (channelId) => {
    try {
        const channel = await bot.channels.fetch(channelId);
        if (!channel) throw new Error(`Channel ${channelId} not found`);
        return channel;
    } catch (error) {
        console.error(`Error fetching channel ${channelId}:`, error);
        throw error;
    }
};

module.exports = {
    bot,
    login,
    getChannel
};
