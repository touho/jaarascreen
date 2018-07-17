const VIEW_DURATION_MINUTES = 60 * 10;
const VIEW_DURATION_TO_HISTORY_MINUTES = 60 * 1;

class ProgramView {
	constructor() {
		this.el = redom.el('div.screenPart#program',
			// redom.el('div.header#programHeader',
			// 	redom.el('img', { src: 'img/Ohjelma_teksti.png' })
			// ),
			this.placesList = redom.list('div.programDivider#places', ProgramPlace),
			redom.el('div#programScroller',
				// redom.el('div#arrow', 'Nyt ->'),
				this.currentTimeIndicator = redom.el('div#currentTimeIndicator'),
				this.columns = redom.list('div.programDivider#programContent', ProgramColumn),
			),
			redom.el('img.leaf.leftLeaf', { src: "img/lehdet_vasen.png" }),
			redom.el('img.leaf.rightLeaf', { src: "img/lehdet_oikea.png" })
		);
	}
	update(program) {
		let places = Object.keys(program);
		this.placesList.update(places);

		this.columns.update(places.map(place => program[place]));

		this.currentTimeIndicator.style.top = getTopValue(new Date());
	}
}

class ProgramPlace {
	constructor() {
		this.el = redom.el('div.programColumn');
	}
	update(place) {
		this.el.textContent = place;
	}
}

class ProgramColumn {
	constructor() {
		this.el = redom.list('div.programColumn', ProgramCell);
	}
	update(placePrograms) {
		this.el.update(placePrograms);
	}
}

class ProgramCell {
	constructor() {
		this.el = redom.el('div.programCell',
			this.name = redom.el('div.programCellName'),
			this.time = redom.el('div.programCellTime')
		)
	}
	update(programEntry) {
		let topTimestamp = new Date(Date.now() - 1000 * 60 * VIEW_DURATION_TO_HISTORY_MINUTES);

		let visualTimestamp = new Date(programEntry.timestamp);
		let visualDuration = programEntry.durationMinutes;
		if (visualTimestamp < topTimestamp) {
			visualDuration -= (topTimestamp - visualTimestamp) / 1000 / 60;
			visualTimestamp = topTimestamp;
		}
		programEntry.endTime = new Date(programEntry.endTime);

		let formattedTime = formatTime(programEntry.timestamp) + ' - ' + formatTime(programEntry.endTime);

		this.name.textContent = programEntry.name;
		this.time.textContent = formattedTime;
		let portionOfView = visualDuration / VIEW_DURATION_MINUTES * 100

		this.el.classList.toggle('tiny', visualDuration < 20);
		this.el.classList.toggle('small', visualDuration >= 20 && visualDuration < 40);

		this.el.style.top = getTopValue(visualTimestamp);
		this.el.style.height = portionOfView.toFixed(3) + '%';
	}
}

function getTopValue(timestamp) {
	let topTimestamp = new Date(Date.now() - 1000 * 60 * VIEW_DURATION_TO_HISTORY_MINUTES);
	let bottomTimestamp = new Date(topTimestamp.getTime() + VIEW_DURATION_MINUTES * 60 * 1000);
	let percentage = (new Date(timestamp) - topTimestamp) / (bottomTimestamp - topTimestamp) * 100
	return percentage.toFixed(3) + '%';
}

function pad2(num) {
	return (num < 10 ? '0' : '') + num;
}

function formatTime(timestamp) {
	timestamp = new Date(timestamp);
	return pad2(timestamp.getHours()) + ':' + pad2(timestamp.getMinutes());
}
