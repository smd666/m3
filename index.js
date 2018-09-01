const botSettings = require("./config.json");
const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require("axios");
const yt = require("ytdl-core");
const YouTube = require("simple-youtube-api");
const fs = require("fs");
const getYTID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const prefix = botSettings.prefix;
const ytApiKey = botSettings.ytApiKey;
const youtube = new YouTube(ytApiKey);

const bot = new Discord.Client({
	disableEveryone: true
});

/* MUSIC VARIABLES */
let queue = []; // Songs queue
let songsQueue = []; // Song names stored for queue command
let isPlaying = false; // Is music playing
let dispatcher = null;
let voiceChannel = null;
let skipRequest = 0; // Stores the number of skip requests 
let skippers = []; // Usernames of people who voted to skip the song
let ytResultList = []; // Video names results from yt command
let ytResultAdd = []; // For storing !add command choice
/* MUSIC VARIABLES END */
let re = /^(?:[1-5]|0[1-5]|10)$/; // RegEx for allowing only 1-5 while selecting song from yt results
let regVol = /^(?:([1][0-9][0-9])|200|([1-9][0-9])|([0-9]))$/; // RegEx for volume control
let youtubeSearched = false; // If youtube has been searched (for !add command)
let selectUser; // Selecting user from guild

bot.on("ready", async () => {
	console.log(`Bot is ready! ${bot.user.username}`);
client.on('ready', async () => {
    console.log('I am ready!');

    client.user.setPresence({ game: { name: 'Horror Magasin', type: 2 } });
});
	/*try {
		let link = await bot.generateInvite(["ADMINISTRATOR"]);
		console.log(link);
	} catch (e) {
		console.log(e.stack);
	}*/

});


const adminprefix = "!";
const devs = ['300572903068663818','431150885549113344'];
bot.on('message', message => {
  var argresult = message.content.split(` `).slice(1).join(' ');
    if (!devs.includes(message.author.id)) return;
    
if (message.content.startsWith(adminprefix + 'setgame')) {
  bot.user.setGame(argresult);
    message.channel.sendMessage(`**${argresult} تم تغيير بلاينق البوت إلى **`)
} else 
  if (message.content.startsWith(adminprefix + 'setname')) {
bot.user.setUsername(argresult).then
    message.channel.sendMessage(`**${argresult}** : تم تغيير أسم البوت إلى`)
return message.reply("**لا يمكنك تغيير الاسم يجب عليك الانتظآر لمدة ساعتين . **");
} else
  if (message.content.startsWith(adminprefix + 'setavatar')) {
bot.user.setAvatar(argresult);
  message.channel.sendMessage(`**${argresult}** : تم تغير صورة البوت`);
      } else     
if (message.content.startsWith(adminprefix + 'setT')) {
  bot.user.setGame(argresult, "https://www.twitch.tv/idk");
    message.channel.sendMessage(`**تم تغيير تويتش البوت إلى  ${argresult}**`)
}

});

bot.on("message", async message => {
	if (message.author.bot) return;
	if (message.channel.type === "dm") return;

	let messageContent = message.content.split(" ");
	let command = messageContent[0];
	let args = messageContent.slice(1);

	if (!command.startsWith(prefix)) return;

	switch (command.slice(1).toLowerCase()) {
		case "userinfo":
if (args.length == 0) { // Displays the message author info if args are empty
	let embed = new Discord.RichEmbed()
		.setThumbnail(message.author.avatarURL)
		.setColor("#8A2BE2")
		.setDescription(`User info for: **${message.author.username}**`)
		.addField("Avatar:", `[Link](${message.author.avatarURL})`, true)
		.addField("Status:", message.author.presence.status, true)
		.addField("Bot: ", message.author.bot, true)
		.addField("In game: ", message.author.presence.game ? message.author.presence.game : "Not in game", true)
		.addField("Tag: ", message.author.tag, true)
		.addField("Discriminator:", message.author.discriminator, true)
		.addBlankField()
		.setFooter(`Profile created at: ${message.author.createdAt}`);

	message.channel.send(embed);
} else { // Else displays info of user from args
	if (message.guild.available) {
		let selectUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
		let embed = new Discord.RichEmbed()
.setThumbnail(selectUser.user.displayAvatarURL)
.setColor("#8A2BE2")
.setDescription(`User info for: **${selectUser.user.username}**`)
.addField("Avatar:", `[Link](${selectUser.user.displayAvatarURL})`, true)
.addField("Status:", selectUser.user.presence.status, true)
.addField("Bot: ", selectUser.user.bot, true)
.addField("In game: ", selectUser.user.presence.game ? selectUser.user.presence.game : "Not in game", true)
.addField("Tag: ", selectUser.user.tag, true)
.addField("Discriminator:", selectUser.user.discriminator, true)
.addBlankField()
.setFooter(`Profile created at: ${selectUser.user.createdAt}`);

		message.channel.send(embed);
	}
}
break;

		case "play":
if (args.length == 0 && queue.length > 0) {
	if (!message.member.voiceChannel) {
		message.reply("**You Need To Be in a Voice Channel To Play Music. Please, Join One And Try Again.**");
	} else {
		isPlaying = true;
		playMusic(queue[0], message);
		message.reply(`Now Playing **${songsQueue[0]}**:musical_note:  `);
	}
} else if (args.length == 0 && queue.length == 0) {
	message.reply(`**Queue is Empty Now, type ${prefix}play [song name] or ${prefix}yt [song name] to play/search new songs!**`);
} else if (queue.length > 0 || isPlaying) {
	getID(args).then(id => {
		if (id) {
queue.push(id);
getYouTubeResultsId(args, 1).then(ytResults => {
	message.reply(`added To Queue **${ytResults[0]}**:notes:`);
	songsQueue.push(ytResults[0]);
}).catch(error => console.log(error));
		} else {
message.reply("Sorry, Couldn't find The Song.");
		}
	}).catch(error => console.log(error));
} else {
	isPlaying = true;
	getID(args).then(id => {
		if (id) {
queue.push(id);
playMusic(id, message);
getYouTubeResultsId(args, 1).then(ytResults => {
	message.reply(`Now Playing **${ytResults[0]}**:musical_note:`);
	songsQueue.push(ytResults[0]);
}).catch(error => console.log(error));
		} else {
message.reply("Sorry, Couldn't Find The Song.");
		}
	}).catch(error => console.log(error));
}
break;

		case "skip":
console.log(queue);
if (queue.length === 1) {
	message.reply(`**queue is empty now, type ${prefix}play [song name] or ${prefix}yt [song name] to play/search new songs!**`);
	dispatcher.end();
	setTimeout(() => voiceChannel.leave(), 1000);
} else {
	if (skippers.indexOf(message.author.id) === -1) {
		skippers.push(message.author.id);
		skipRequest++;

		if (skipRequest >= Math.ceil((voiceChannel.members.size - 1) / 2)) {
skipSong(message);
message.reply("**Your Skip has Been Added To The List. Skipping!**");
		} else {
message.reply(`Your Skip has Been Added to the list. You need **${Math.ceil((voiceChannel.members.size - 1) / 2) - skipRequest}** more to skip current song!`);
		}
	} else {
		message.reply("**You Already Voted To Skip!**");
	}
}
break;

		case "queue":
if (queue.length === 0) { // if there are no songs in the queue, send message that queue is empty
	message.reply(`**Queue is empty, type ${prefix}play or ${prefix}yt to play/search new songs!**`);
} else if (args.length > 0 && args[0] == 'remove') { // if arguments are provided and first one is remove
	if (args.length == 2 && args[1] <= queue.length) { // check if there are no more than 2 arguments and that second one is in range of songs number in queue
		// then remove selected song from the queue
		message.reply(`**${songsQueue[args[1] - 1]}** has been removed from the queue. Type !queue to see the current queue.`);
		queue.splice(args[1] - 1, 1);
		songsQueue.splice(args[1] - 1, 1);
	} else { // if there are more than 2 arguments and the second one is not in the range of songs number in queue, send message
		message.reply(`**You Need To Enter Valid Queued Song number **(1-${queue.length}).`);
	}
} else if (args.length > 0 && args[0] == 'clear') { // same as remove, only clears queue if clear is first argument
	if (args.length == 1) {
		// reseting queue and songsQueue, but leaving current song
		message.reply(`all upcoming songs have been removed from the queue. type ${prefix}play or ${prefix}yt to play/search new songs!`);
		queue.splice(1);
		songsQueue.splice(1);
	} else {
		message.reply("**You need to type !queue clear without following arguments.**");
	}
} else if (args.length > 0 && args[0] == 'shuffle') {
	let tempA = [songsQueue[0]];
	let tempB = songsQueue.slice(1);
	songsQueue = tempA.concat(shuffle(tempB));
	message.channel.send("Queue has been shuffled. Type !queue to see the new queue!");
} else { // if there are songs in the queue and queue commands is without arguments display current queue
	let format = "```"
	for (const songName in songsQueue) {
		if (songsQueue.hasOwnProperty(songName)) {
let temp = `${parseInt(songName) + 1}: ${songsQueue[songName]} ${songName == 0 ? "**(Current Song)**" : ""}\n`;
if ((format + temp).length <= 2000 - 3) {
	format += temp;
} else {
	format += "```";
	message.channel.send(format);
	format = "```";
}
		}
	}
	format += "```";
	message.channel.send(format);
}
break;

		case "repeat":
if (isPlaying) {
	queue.splice(1, 0, queue[0]);
	songsQueue.splice(1, 0, songsQueue[0]);
	message.reply(`**${songsQueue[0]}** Will be played again.`);
}
break;

		case "stop":
dispatcher.end();
setTimeout(() => voiceChannel.leave(), 1000);
break;

		case "yt":
if (args.length == 0) {
	message.reply(`you need to enter search term (${prefix} [search term]).`);
} else {
	message.channel.send("```Searching youtube...```");
	getYouTubeResultsId(args, 5).then(ytResults => {
		ytResultAdd = ytResults;
		let ytEmbed = new Discord.RichEmbed()
.setColor("#FF0000")
.setAuthor("Youtube search results: ", icon_url = "https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-512.png")
.addField("1:", "```" + ytResults[0] + "```")
.addField("2:", "```" + ytResults[1] + "```")
.addField("3:", "```" + ytResults[2] + "```")
.addField("4:", "```" + ytResults[3] + "```")
.addField("5:", "```" + ytResults[4] + "```")
.addBlankField()
.setFooter("Send !add [result number] to queue the song.");
		message.channel.send(ytEmbed);
		youtubeSearched = true;
	}).catch(err => console.log(err));
}
break;

		case "add":
if (youtubeSearched === true) {
	if (!re.test(args)) {
		message.reply("you entered the wrong song number or character. Please only enter 1-5 for song number to be queued.");
	} else {
		let choice = ytResultAdd[args - 1];
		getID(choice).then(id => {
if (id) {
	queue.push(id);
	getYouTubeResultsId(choice, 1).then(ytResults => {
		message.reply(`added to queue **${ytResults[0]}**`);
		songsQueue.push(ytResults[0]);
	}).catch(error => console.log(error));
}
		}).catch(error => console.log(error));
		youtubeSearched = false;
	}
} else {
	message.reply(`you need to use ${prefix}yt [search term] command first to add song from the list to the queue.`);
}
break;

		case "vol":
if (args.length == 0 && dispatcher) {
	message.reply(`current volume is ${dispatcher.volume}. Type !vol [percentage - 0 to 200] to set music volume.`);
} else if (args.length > 0 && regVol.test(args) == true && dispatcher) {
	dispatcher.setVolume(args * 0.01);
	message.reply(`music volume has been set to ${args}%.`);
	console.log(dispatcher.volume);
} else if (!regVol.test(args) && dispatcher) {
	message.reply("you need to enter a number in 0-200 range.");
} else {
	message.reply("you can only set music volume if music is playing.");
}
break;

		case "help":
message.channel.send(`
#User
**${prefix}userinfo** [Username or blank] : displays info for the selected user or for message sender if arguments are not provided

#Music
**${prefix}play** [Song Name Or Blank]": Plays a Song Or if Arguments are Not Provided Plays The First Song in The Queue

**${prefix}skip** : Skips The Current Song

**${prefix}queue** : displays Current Queue

**${prefix}queue remove** [Song Number] : Removes Chosen Song From The Queue

**${prefix}queue clear**: Removes All Songs From The Queue

**${prefix}queue shuffle** : Shuffles The Current Queue

**${prefix}repeat**: Plays Current Song Again

**${prefix}stop** : Stops Playing Music And Deletes All Songs in The Queue

**${prefix}yt** [Search Term] : Searches The YouTube and Returns First 5 Results

**${prefix}add** [Search Result Number] : adds a Song From YouTube Search To The Queue

**${prefix}vol** [percentage] : Sets The Volume of The Music To Given Percentage
`);
break;

		case "commands":
message.channel.send(`
#User
**${prefix}userinfo** [Username or blank] : displays info for the selected user or for message sender if arguments are not provided

#Music
**${prefix}play** [Song Name Or Blank]": Plays a Song Or if Arguments are Not Provided Plays The First Song in The Queue

**${prefix}skip** : Skips The Current Song

**${prefix}queue** : displays Current Queue

**${prefix}queue remove** [Song Number] : Removes Chosen Song From The Queue

**${prefix}queue clear**: Removes All Songs From The Queue

**${prefix}queue shuffle** : Shuffles The Current Queue

**${prefix}repeat**: Plays Current Song Again

**${prefix}stop** : Stops Playing Music And Deletes All Songs in The Queue

**${prefix}yt** [Search Term] : Searches The YouTube and Returns First 5 Results

**${prefix}add** [Search Result Number] : adds a Song From YouTube Search To The Queue

**${prefix}vol** [percentage] : Sets The Volume of The Music To Given Percentage
`);
break;


	}
});

/*--------------------------------*/
/* MUSIC CONTROL FUNCTIONS START */
/*------------------------------*/
function playMusic(id, message) {
	voiceChannel = message.member.voiceChannel;

	voiceChannel.join()
		.then(connection => {
console.log("Connected...");
stream = yt(`https://www.youtube.com/watch?v=${id}`, {
	filter: 'audioonly'
})

skipRequest = 0;
skippers = [];

dispatcher = connection.playStream(stream);
dispatcher.setVolume(0.25);
dispatcher.on('end', () => {
	skipRequest = 0;
	skippers = [];
	queue.shift();
	songsQueue.shift();
	if (queue.length === 0) {
		console.log("Disconnected...");
		queue = [];
		songsQueue = [];
		isPlaying = false;
	} else {
		setTimeout(() => playMusic(queue[0], message), 500);
	}
});
		})
		.catch(error => console.log(error));
}

async function getID(str) {
	if (str.indexOf("youtube.com") > -1) {
		return getYTID(str);
	} else {
		let body = await axios(`https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${encodeURIComponent(str)}&key=${ytApiKey}`);
		if (body.data.items[0] === undefined) {
return null;
		} else {
return body.data.items[0].id.videoId;
		}
	}
}

function addToQueue(strID) {
	if (strID.indexOf("youtube.com")) {
		queue.push(getYTID(strID));
	} else {
		queue.push(strID);
		songsQueue.push(strID);
	}
}

function skipSong(message) {
	dispatcher.end();
}
/*------------------------------*/
/* MUSIC CONTROL FUNCTIONS END */
/*----------------------------*/

/*----------------------------------*/
/* YOUTUBE CONTROL FUNCTIONS START */
/*--------------------------------*/
async function searchYouTube(str) {
	let search = await axios(`https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${encodeURIComponent(str)}&key=${ytApiKey}`);
	if (search.data.items[0] === undefined) {
		return null;
	} else {
		return search.data.items;
	}
}

async function getYouTubeResultsId(ytResult, numOfResults) {
	let resultsID = [];
	await youtube.searchVideos(ytResult, numOfResults)
		.then(results => {
for (const resultId of results) {
	resultsID.push(resultId.title);
}
		})
		.catch(err => console.log(err));
	return resultsID;
}
/*--------------------------------*/
/* YOUTUBE CONTROL FUNCTIONS END */
/*------------------------------*/

/*-----------------------*/
/* MISC FUNCTIONS START */
/*---------------------*/
function shuffle(queue) {
	for (let i = queue.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[queue[i], queue[j]] = [queue[j], queue[i]];
	}
	return queue;
}
/*---------------------*/
/* MISC FUNCTIONS END */
/*-------------------*/


bot.login(process.env.BOT_TOKEN);
