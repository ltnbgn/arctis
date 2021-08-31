const { LOCALE } = require("../utilities/ArctisUtility");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
	name: "leave",
	cooldown: 3,
	aliases: ["l"],
	description: i18n.__("leave.description"),
	execute(message) {
		const { channel } = message.member.voice;
		const serverQueue = message.client.queue.get(message.guild.id);

        if (!channel)
            return message.reply(i18n.__("common.errorNotChannel")).catch(console.error);

        if (serverQueue && channel !== message.guild.me.voice.channel)
			return message
				.reply(i18n.__mf("common.errorNotInSameChannel", { user: message.client.user }))
				.catch(console.error);

        channel.leave()
	}
};
