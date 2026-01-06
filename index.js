const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());

app.use(bodyParser.json());

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

bot.once('ready', () => {
    console.log(`${bot.user.tag} is online!`);
});

bot.login(process.env.DISCORD_TOKEN);

const CHANNEL_ID = process.env.CHANNEL_ID;

app.post('/add-note', async (req, res) => {
    const { note } = req.body;
    try {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        await channel.send(note);
        res.status(200).send('Note added!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding note.');
    }
});

app.get('/get-notes', async (req, res) => {
    try {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        const messages = await channel.messages.fetch({ limit: 100 });
        const notes = messages.map(msg => ({ id: msg.id, content: msg.content }));
        res.status(200).json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching notes.');
    }
});

app.post('/edit-note', async (req, res) => {
    const { id, updatedNote } = req.body;
    try {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        const message = await channel.messages.fetch(id);
        await message.edit(updatedNote);
        res.status(200).send('Note updated!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error editing note.');
    }
});

app.delete('/delete-note', async (req, res) => {
    const { id } = req.body;
    try {
        const channel = await bot.channels.fetch(CHANNEL_ID);
        const message = await channel.messages.fetch(id);
        await message.delete();
        res.status(200).send('Note deleted!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting note.');
    }
});

app.listen(3001, () => {
    console.log('Backend is running on http://localhost:3001');
});