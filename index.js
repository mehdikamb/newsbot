const { EmbedBuilder } = require('@discordjs/builders');
const Discord = require('discord.js');
const fs = require('fs').promises;

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(client.user.tag);
    fetchAndSendNews();
    setInterval(fetchAndSendNews, 1800000);
});

client.on('messageCreate', msg => {
    if (msg.content === '!api') {
        msg.reply('https://newsapi.org/v2/top-headlines?country=tr&apiKey=');
    }
});

const fetchAndSendNews = async () => {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('https://newsapi.org/v2/top-headlines?country=tr&apiKey= YOUR API KEY');
        const data = await response.json();
        
        fs.readFile('config.json', 'utf8')
            .then(configData => {
                const config = JSON.parse(configData);
                const newsChannelId = config.channel;
                const channel = client.channels.cache.get(newsChannelId);
                if (channel && data.articles) {
                    let index = 0;
                    const sendArticle = () => {
                        if (index < data.articles.length) {
                            const article = data.articles[index];
                            const embed = new EmbedBuilder()
                                .setTitle(`${article.author}`)
                                .setDescription(`**${article.title}**`);
                            channel.send({embeds: [embed]});
                            index++;
                            setTimeout(sendArticle, 5000); // 5 SECOND
                        }
                    };
                    sendArticle();
                } else {
                    console.error('Channel could not be found or news could not be received');
                }
            })
            .catch(err => {
                console.error('Error reading config file:', err);
            });
    } catch (error) {
        console.error('An error occurred while fetching the news:', error);
    }
};

fs.readFile('config.json', 'utf8')
    .then(data => {
        const config = JSON.parse(data);
        client.login(config.token).catch(console.error);
    })
    .catch(err => {
        console.error('Error in config file details:', err);
    });
