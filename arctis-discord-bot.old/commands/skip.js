const { canModifyQueue, LOCALE } = require("../utilities/ArctisUtility");
const i18n = require("i18n");

i18n.setLocale(LOCALE);

module.exports = {
  name: "skip",
  aliases: ["s", "next"],
  description: i18n.__("skip.description"),
  execute(message) {
    const queue = message.client.queue.get(message.guild.id);

    if (!queue) return message.reply(i18n.__("common.errorNotQueue")).catch(console.error);

    if (!canModifyQueue(message.member)) return i18n.__("common.errorNotChannel");

    queue.playing = true;
    queue.connection.dispatcher.end();
    queue.textChannel.send(i18n.__mf("skip.result", { author: message.author })).catch(console.error);
  }
};
