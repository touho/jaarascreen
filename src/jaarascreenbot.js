const fs = require('fs');
const request = require('request');
const path = require('path');

const MESSAGE_FILE_PATH = path.resolve(__dirname, '../messages.txt');
const PHOTOS_FOLDER = path.resolve(__dirname, '../public/photos');
const TELEGRAM_BOT_TOKEN = process.env['TELEGRAM_BOT_TOKEN'];
const CHAR_LIMIT = 140;

const Slimbot = require('slimbot');
const slimbot = new Slimbot(TELEGRAM_BOT_TOKEN);

async function messageReceived(message) {
	try {
		await handlePhoto(message);
		await handleCommand(message);
	} catch(e) {
		console.log('JaaraScreenBot ERROR:', e);
	}
}

async function handlePhoto(message) {
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

	console.log('New photo:', newFileName, `(${Math.round(photo.file_size/1000)} kb)`);
	let photoDownloadURL = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${photoInfoResponse.result.file_path}`;
	request(photoDownloadURL).pipe(fs.createWriteStream(`${PHOTOS_FOLDER}/${newFileName}`))
	.on('error', function(err) {
		console.log('pipe error', err);
	});

	//slimbot.sen
}
async function handleCommand(message) {
	let text = message.text;
	if (!text)
		return;

	// if (message.from.username === 'tebbo')
	// 	slimbot.sendMessage(message.chat.id, 'Viisaasti sanottu, Teppo.');

	let command = '/jaarascreen';
	if (text.startsWith(command)) {
		let msg = text.substring(command.length + 1);
		msg = msg.replace(/[\s\n\t]+/g, ' ').trim();
		if (msg.length === 0) {
			slimbot.sendMessage(message.chat.id, `To make your ${CHAR_LIMIT} character thought visible in Jaara, type:\n${command} <your thought>`);
		} else {
			if (msg.length > CHAR_LIMIT)
				msg = msg.substring(0, CHAR_LIMIT - 3) + '...';

			msg += ` -${message.from.first_name}`;
			slimbot.sendMessage(message.chat.id, msg);
			fs.appendFileSync(MESSAGE_FILE_PATH, msg + '\n');

			console.log(msg);
		}
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

fs.existsSync(MESSAGE_FILE_PATH, (exists) => {
	if (!exists)
		fs.writeFileSync(MESSAGE_FILE_PATH, '');
});

fs.existsSync(PHOTOS_FOLDER, (exists) => {
	if (!exists)
		fs.mkdirSync(PHOTOS_FOLDER);
});
