const { Command } = require('discord.js-commando');
const request = require('request');
const { MessageEmbed } = require('discord.js');
const config = require('../../config');

const IP = config.serverIp;

const details = {
    's1': {
        port: '30123',
        name: 'Main Server'
    },
    's2': {
        port: '30124',
        name: 'Secondary Server'
    },
    'tr': {
        port: '30199',
        name: 'Training Server'
    },
    'temp': {
        port: '3014',
        name: 'Temporary Server'
    }
};

let serverData = [];
let playerData = [];

module.exports = class Status extends Command {
    constructor(client) {
        super(client, {
            name: 'players',
            group: 'information',
            memberName: 'players',
            description: 'Displays the player list for the specified FiveM server.',
            clientPermissions: ['EMBED_LINKS'],
            examples: [
                '..players s1 false',
                '..players s2',
                '..players'
            ],
            args: [
                {
                    key: 'server',
                    prompt: 'Which server would you like to see the players?',
                    type: 'string',
                    default: 'temp',
                    oneOf: [
                        's1',
                        's2',
                        'tr',
                        'temp'
                    ]
                },
                {
                    key: 'shorten',
                    prompt: 'Would you like to shorten the output?',
                    type: 'boolean',
                    default: false
                }
            ]
        });
    }

    async run(message, { server, shorten }) {
        const member = message.member || message.guild.members.fetch(message.author);
        const embedColor = member.roles.color ? member.roles.color.color : '#23E25D';

        // remove the command entered by the user
        message.delete();

        // Error Embed for both Players and Server information request query
        const serverDownEmbed = new MessageEmbed()
            .setAuthor(`Server Information - ${details[server].name}`, message.guild.iconURL(), 'https://discourse.jcrpweb.com')
            .addField('Server IP', IP + ':' + details[server].port)
            .addField('Status', 'Offline')
            .setColor('#FF9C00')
            .setTimestamp();

        // Player's data request query
        request.get(`http://${IP}:${details[server].port}/players.json`, {
            timeout: 2000
        }, function(error, _, playersBody) {
            if(error) {
                return message.reply({ embed: serverDownEmbed });
            }

            // server information query
            request.get(`http://${IP}:${details[server].port}/info.json`, {
                timeout: 2000
            }, function(_error, __, serverBody) {
                if (error) {
                    return message.reply({ embed: serverDownEmbed });
                }

                // Try function for both ServerData Parser and playersData Parser
                try {
                    serverData = JSON.parse(serverBody);
                    playerData = JSON.parse(playersBody);
                }
                catch(err) {
                    return message.reply(`An error occurred while running the command: \n\`${err.name}: ${err.message}\`\nYou shouldn't ever receive an error like this.\nPlease contact @DEVTEAMTAGHERE.`) && console.log(err);
                }

                // Sorting server players by thier unique In-Game ID
                const sortedPlayers = playerData.map(key => ({ id: key.id, name: key.name })).sort((first, second) => (first.id < second.id) ? -1 : (first.id > second.id) ? 1 : 0);

                const embed = new MessageEmbed()
                    .setAuthor(`Server Information - ${details[server].name}`, message.guild.iconURL(), 'https://discourse.jcrpweb.com')
                    .setDescription(shorten ? sortedPlayers.length > 0 ? sortedPlayers.map(sp => sp.name).join('\n') : 'No players found!' : sortedPlayers.length > 0 ? sortedPlayers.map(sp => '**ID: ' + sp.id + '** - ' + sp.name).join('\n') : 'No players found!')
                    .addField('Join Server', '<fivem://connect/' + IP + ':' + details[server].port + '/>')
                    .setTitle('Player count: ' + playerData.length + '/' + serverData.vars.sv_maxClients)
                    .setColor(embedColor)
                    .setTimestamp();

                if (serverData.vars.rpArea !== undefined) {
                    embed.addField('AOP', serverData.vars.rpArea);
                }

                return message.reply({ embed: embed });
            });
        });
    }
};
