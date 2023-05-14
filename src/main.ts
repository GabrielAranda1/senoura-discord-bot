import { Client, GatewayIntentBits } from 'discord.js'

import dotenv from 'dotenv'
import { Player } from 'discord-player'

dotenv.config()

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates] })

discordClient.once('ready', () => {
  console.log('BOT is good to go!')
})

discordClient.login(process.env.DISCORD_BOT_TOKEN)

discordClient.on('messageCreate', async message => {

  if (message.author.bot) return;

  if (message.content.startsWith('!play')) {
    const userCurrentlyVoiceChannel = message.member!.voice.channel;

    if (!userCurrentlyVoiceChannel) {
      message.reply('You need to join a voice channel first!');
      return
    }

    const url = message.content.replace('!play ', '');

    const player = new Player(discordClient, {
      ytdlOptions: {
        quality: 'highestaudio',
      },
    })

    await player.extractors.loadDefault()

    const queue = player.queues.create(userCurrentlyVoiceChannel?.guild!)

    if (!queue.connection) await queue.connect(userCurrentlyVoiceChannel!)

    const searchResult = await player.search(url, {
      requestedBy: message.author,
      searchEngine: 'auto'
    })

    if (searchResult.tracks.length === 0) message.reply('No results found!')

    const track = searchResult.tracks[0]
    await player.play(userCurrentlyVoiceChannel, track)
  }
})