const GoogleSpreadsheet = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');

const MAX_MESSAGES = 5;
const PROGRAM_SHEET_COLUMNS = 9;
const GOOGLE_SERVICE_ACCOUNT_KEY_JSON_PATH = process.env['GOOGLE_SERVICE_ACCOUNT_KEY_JSON_PATH'];
let doc = new GoogleSpreadsheet(process.env['SPREADSHEET_KEY']);

const PHOTOS_FOLDER = path.resolve(__dirname, '../public/photos');
const MESSAGE_FILE_PATH = path.resolve(__dirname, '../messages.txt');

let sheets = module.exports;

let cacheData = null;

sheets.getData = async function () {
	if (cacheData) {
		return cacheData;
	} else {
		return {
			infoMessages: [],
			program: [],
			pictures: [],
			messages: []
		};
	}
};

async function getSheetInfo() {
	let info = await new Promise((resolve, reject) => {
		doc.getInfo(function (err, info) {
			if (err) reject(err);
			else resolve(info);
		});
	});

	if (!info.title.includes('JaaraScreen')) {
		let errorMsg = `Sheet title must include "JaaraScreen". Instead, it is "${info.title}"`;
		//console.log(errorMsg);
		throw new Error(errorMsg);
	}

	return info;
}

sheets.addMessage = async function() {
	let info = await getSheetInfo();
	let messageSheet = info.worksheets.find(sheet => sheet.title === 'Messages');
	messageSheet.addRow();

};

async function updateCache() {
	let info = await getSheetInfo();

	let programSheet = info.worksheets.find(sheet => sheet.title === 'Program');
	let infoSheet = info.worksheets.find(sheet => sheet.title === 'Info');
	//let messageSheet = info.worksheets.find(sheet => sheet.title === 'Messages');

	if (!programSheet || !infoSheet) {
		console.log('Sheet must have sheets "Program" and "Info"');
		return;
	}

	let program = await new Promise((resolve, reject) => {
		programSheet.getCells({
			'min-row': 2,
			'max-row': programSheet.rowCount,
			'min-col': 1,
			'max-col': PROGRAM_SHEET_COLUMNS,
			'return-empty': true
		}, function (err, cells) {
			if (err)
				return reject(err);

			let program = {};

			for (let i = 0; i < cells.length - 3; i += PROGRAM_SHEET_COLUMNS) {
				let year = cells[i].value;
				if (year > 1000 && year < 10000) {
					let entry = {
						timestamp: new Date(
							cells[i].value,
							cells[i + 1].value - 1,
							cells[i + 2].value,
							cells[i + 3].value,
							cells[i + 4].value
						),
						durationMinutes: cells[i + 5].value,
						place: cells[i + 6].value,
						name: cells[i + 7].value,
						info: cells[i + 8].value
					};

					entry.endTime = new Date(entry.timestamp.getTime() + 1000*60*entry.durationMinutes);

					if (entry.endTime < new Date(Date.now() - 1000 * 60 * 60 * 2))
						continue;

					if (entry.timestamp > new Date(Date.now() + 1000 * 60 * 60 * 14))
						continue;

					if (!program[entry.place]) {
						program[entry.place] = [];
					}

					program[entry.place].push(entry);
				}
			}

			for (let place in program) {
				let programPlace = program[place];
				programPlace.sort((a, b) => {
					return b.timestamp - a.timestamp > 0 ? -1 : 1;
				});
			}

			resolve(program);
		});
	});

	let infoMessages = await new Promise((resolve, reject) => {
		infoSheet.getCells({
			'max-row': MAX_MESSAGES,
			'min-col': 2,
			'max-col': 2,
			'return-empty': false
		}, function (err, cells) {
			if (err)
				return reject(err);

			let messages = [];
			cells.forEach(cell => messages.push(cell.value));

			resolve(messages);
		});
	});

	let pictures = fs.readdirSync(PHOTOS_FOLDER).filter(photo => !photo.startsWith('.')).slice(-10).map(photo => 'photos/' + photo);
	let messageData = fs.readFileSync(MESSAGE_FILE_PATH, 'utf-8');
	let messages = messageData.split('\n').filter(Boolean).slice(-10);

	cacheData = {
		infoMessages,
		pictures,
		messages,
		program
	};
}

function callUpdateCache() {
	updateCache().catch(e => {
		console.log('Drive update failed', e);
	});
}

setInterval(callUpdateCache, 10000);

if (GOOGLE_SERVICE_ACCOUNT_KEY_JSON_PATH) {
	var creds = require('../' + GOOGLE_SERVICE_ACCOUNT_KEY_JSON_PATH);
	doc.useServiceAccountAuth(creds, function () {
		console.log('Drive authenticated.', arguments);
		init().catch(e => {
			console.log('Drive init error.', e);
		});
	});
}

async function init() {
	let info = await new Promise((resolve, reject) => {
		doc.getInfo(function (err, info) {
			if (err) reject(err);
			else resolve(info);
		});
	});

	async function makeSureWorksheetExists(name, createdCallback) {
		let sheet = info.worksheets.find(sheet => sheet.title === name);
		if (!sheet) {
			await new Promise((resolve, reject) => {
				doc.addWorksheet({title: name}, function (err, sheet) {
					if (err)
						return console.log('Add worksheet error. Do I have write rights? Or does the sheet have edit rights for people with link?', ('' + err).substring(0, 300));
					else
						createdCallback(sheet);

					console.log('Sheet', sheet.title, 'created.');
					resolve();
				});
			});
		}
	}

	await makeSureWorksheetExists('Program', sheet => {
		sheet.getCells({
			'max-row': 2,
			'max-col': PROGRAM_SHEET_COLUMNS,
			'return-empty': true
		}, function (err, cells) {
			let now = new Date();
			let data = ['Year','Month','Day','Hour','Minutes','Duration minutes','Place','Name','Info',
				now.getFullYear(),
				now.getMonth() + 1,
				now.getDate(),
				''+now.getHours(),
				'0',
				60,
				'Place 1',
				'Band playing',
				'Comments...'
			];

			for (let i = 0; i < data.length; i++) {
				cells[i].value = data[i];
			}

			sheet.bulkUpdateCells(cells);
		});
	});
	await makeSureWorksheetExists('Info', sheet => {
		sheet.getCells({
			'max-row': MAX_MESSAGES,
			'max-col': 2,
			'return-empty': true
		}, function (err, cells) {
			for (let i = 0; i < MAX_MESSAGES; i++) {
				cells[i * 2].value = "'" + (i + 1) + '.';
				if (i < 3)
					cells[i * 2 + 1].value = 'Message ' + (i + 1);
			}
			sheet.bulkUpdateCells(cells);
		});
	});
	await makeSureWorksheetExists('Messages', sheet => {

	});

	callUpdateCache();
}
