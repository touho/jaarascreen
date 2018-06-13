let data = null;

let programView = new ProgramView();
setTimeout(() => {
	jaarascreen.insertBefore(programView.el, screenRight);
}, 0);

function fetchData() {
	var xhttp = new XMLHttpRequest();
	xhttp.addEventListener("load", function() {
		data = JSON.parse(xhttp.responseText);

		data.pictures = data.pictures.slice(-10); // last 10 photos
		data.messages = data.messages.slice(-10); // last 10 messages

		infoContent.innerHTML = data.infoMessages.map(msg => '- ' + msg).join('<br>');

		programView.update(data.program);
	});
	xhttp.open("GET", "getData", true);
	xhttp.send();
}

setTimeout(fetchData, 100);
setInterval(fetchData, 10000);

let showCounts = {};
let showDateTimes = {};
let currentPic = null;
let currentText = null;

function updateImage() {
	if (!data)
		return;

	let pics = data.pictures;
	let msgs = data.messages;

	pic.classList.add('hide');
	setTimeout(() => {
		currentPic = choose(pics, currentPic);
		currentText = choose(msgs, currentText);

		if (currentPic)
			image.src = currentPic;

		if (currentText)
			imageText.textContent = currentText;

		showCounts[currentPic] = (showCounts[currentPic] || 0) + 1;
		showDateTimes[currentPic] = new Date();

		showCounts[currentText] = (showCounts[currentText] || 0) + 1;
		showDateTimes[currentText] = new Date();

		pic.classList.remove('hide');
	}, 1000);
}

setTimeout(updateImage, 500);
setInterval(updateImage, 10000);

function choose(array, current) {
	let spec = {};
	function getScore(key) {
		let count = Math.min(showCounts[key] || 0, 100);
		let age = Math.min(new Date() - (showDateTimes[key] || new Date(0)), 500000);
		let score = age / (count + 0.2);

		if (key === current)
			score /= 1000;

		return score;
	}
	let totalScore = 0;
	for (let key of array) {
		let score = getScore(key);
		totalScore += score;
		spec[key] = score;
	}

	return weightedChooser(spec, totalScore);
}

function weightedChooser(spec, totalScore) {
	var i, sum=0, r=Math.random() * totalScore;
	for (i in spec) {
		sum += spec[i];
		if (r <= sum) return i;
	}
	return null;
}
