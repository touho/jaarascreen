const sheets = require('./sheets');
const PORT = process.env['PORT'];

const express = require('express');
const app = express();

app.use(express.static('public'))

app.get('/getData', async function (req, res) {
	let data = await sheets.getData();
	res.setHeader('Content-Type', 'application/json');
	res.send(data)
});

app.listen(PORT || 8082);
