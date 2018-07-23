process.env.TZ = 'Europe/Helsinki';

const sheets = require('./sheets');
const calendar = require('./calendar');
const PORT = process.env['PORT'];

const progeda = require('./progeda');

const express = require('express');
const app = express();

app.use(express.static('public'))

app.get('/getData', async function (req, res) {
	let data = await sheets.getData();
	res.setHeader('Content-Type', 'application/json');
	res.send(data)
});

progeda.start(app);

app.listen(PORT || 8082);
