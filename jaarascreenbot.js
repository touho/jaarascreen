const fs = require('fs');
const request = require('request');
const path = require('path');

const TELEGRAM_BOT_TOKEN = process.env['TELEGRAM_BOT_TOKEN'];

const Slimbot = require('slimbot');
const slimbot = new Slimbot(TELEGRAM_BOT_TOKEN);

async function messageReceived(message) {
	try {
		let photo = choosePhoto(message);
		if (!photo)
			return;

		let msgId = message.message_id;

		let photoInfoResponse = await slimbot.getFile(photo.file_id);
		if (!photoInfoResponse.ok)
			return;

		let extension = path.extname(photoInfoResponse.result.file_path);

		let now = new Date();
		let date = now.toISOString().substring(0, 10);
		let hours = pad2(now.getUTCHours());
		let minutes = pad2(now.getUTCMinutes());
		let seconds = pad2(now.getUTCSeconds());

		// usernames can contain underscores
		//let newFileName = `${date}.${hours}.${minutes}.${seconds}.(${msgId}).${message.from.username}${extension}`;
		let newFileName = `${msgId}.${message.from.username}${extension}`;

		console.log('newFileName', newFileName);
		let photoDownloadURL = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${photoInfoResponse.result.file_path}`;
		request(photoDownloadURL).pipe(fs.createWriteStream(`photos/${newFileName}`)); // .on('close', callback);
	} catch(e) {
		console.log('JaaraScreenBot ERROR:', e);
	}
}

// Register listeners
slimbot.on('message', messageReceived);
slimbot.on('channel_post', messageReceived);

// Call API
slimbot.startPolling();

function choosePhoto(message) {
	if (!message.photo || message.photo.length <= 0)
		return null;
	let photos = message.photo;
	let photo = photos[0];
	for (let i = 1; i < photos.length; i++) {
		let newSize = photos[i].file_size;
		if (newSize > photo.file_size && newSize < 400000) {
			photo = photos[i];
		}
	}
	return photo;
}

function pad2(number) {
	return (number < 10 ? '0' : '') + number
}
