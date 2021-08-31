const ytdl = require("ytdl-core-discord");
const { canModifyQueue, STAY_TIME, LOCALE } = require("../utilities/ArctisUtility");
const i18n = require("i18n");
i18n.setLocale(LOCALE);

module.exports = {
	async play(song, message) {
		let config;

		try {
			config = require("../config.json");
		} catch (error) {
			config = null;
		}

		const PRUNING = config ? config.PRUNING : process.env.PRUNING;

		const queue = message.client.queue.get(message.guild.id);

		if (!song) {
			setTimeout(function () {
				if (queue.connection.dispatcher && message.guild.me.voice.channel) return;
				queue.channel.leave();
				queue.textChannel.send(i18n.__("play.leaveChannel"));
		}, STAY_TIME * 1000);
			queue.textChannel.send(i18n.__("play.queueEnded")).catch(console.error);
			return message.client.queue.delete(message.guild.id);
		}

		let stream = null;
		let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

		try {
			if (song.url.includes("youtube.com")) {
				stream = await ytdl(song.url, { highWaterMark: 1 << 25 });
			}
		} catch (error) {
			if (queue) {
				queue.songs.shift();
				module.exports.play(queue.songs[0], message);
		}

		console.error(error);
			return message.channel.send(
				i18n.__mf("play.queueError", { error: error.message ? error.message : error })
			);
		}

		queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

		const dispatcher = queue.connection
			.play(stream, { type: streamType })
			.on("finish", () => {
				if (collector && !collector.ended) collector.stop();

				if (queue.loop) {
				// if loop is on, push the song back at the end of the queue
				// so it can repeat endlessly
				let lastSong = queue.songs.shift();
					queue.songs.push(lastSong);
					module.exports.play(queue.songs[0], message);
				} else {
					// Recursively play the next song
					queue.songs.shift();
					module.exports.play(queue.songs[0], message);
				}
		})
		.on("error", (err) => {
			console.error(err);
			queue.songs.shift();
			module.exports.play(queue.songs[0], message);
		});

		dispatcher.setVolumeLogarithmic(queue.volume / 100);

		try {
			var playingMessage = await queue.textChannel.send(
				i18n.__mf("play.startedPlaying", { title: song.title, url: song.url })
			);
		} catch (error) {
			console.error(error);
		}

		const filter = (reaction, user) => user.id !== message.client.user.id;
			var collector = playingMessage.createReactionCollector(filter, {
			time: song.duration > 0 ? song.duration * 1000 : 600000
		});

		collector.on("end", () => {
			playingMessage.reactions.removeAll().catch(console.error);

			if (PRUNING && playingMessage && !playingMessage.deleted)
				playingMessage.delete({ timeout: 3000 }).catch(console.error);
		});
	}
};
