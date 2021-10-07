const { LOCALE } = require("../utilities/ArctisUtility");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "join",
  cooldown: 3,
  aliases: ["j"],
  description: i18n.__("join.description"),
  execute(message) {
    const { channel } = message.member.voice;
    const serverQueue = message.client.queue.get(message.guild.id);

    if (!channel) return message.channel.send(i18n.__("common.errorNotChannel")).catch(console.error);

    if (serverQueue && channel !== message.guild.me.voice.channel)
      return message.channel
        .send(i18n.__mf("common.errorNotInSameChannel", { user: message.client.user }))
        .catch(console.error);

    channel.join();

    return message.channel.send(i18n.__("common.join")).catch(console.error);
  }
};
