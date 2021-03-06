const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const config = require('../../config');


module.exports = class SetNick extends Command {
    constructor(client) {
        super(client, {
            name: 'setnick',
            aliases: ['snick', 'sn'],
            group: 'administration',
            memberName: 'setnick',
            description: 'Sets a member\'s nickname.',
            userPermissions: ['MOVE_MEMBERS'],
            clientPermissions: ['MOVE_MEMBERS'],
            guildOnly: true,
            hidden: true,
            args: [
                {
                    key: 'member',
                    prompt: 'Which member would you like to change the nickname of?',
                    type: 'member'
                },
                {
                    key: 'newNick',
                    prompt: 'What would you like to set their nickname to?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, { member, newNick }) {
        message.delete();
        const oldNick = member.displayName;
        member.setNickname(newNick);
        message.reply(member + ' nickname was changed to ' + newNick);

        const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.avatarURL())
            .setDescription(member + ' nickname was changed from ' + oldNick + ' to ' + newNick + ' by ' + message.member + '!')
            .setTimestamp()
            .setColor(config.embedColors.action);

        return this.client.channels.find(logC => logC.id === config.logChannels.member).send({ embed: embed });
    }
};