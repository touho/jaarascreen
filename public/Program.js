const VIEW_DURATION_MINUTES = 60*16;
const VIEW_DURATION_TO_HISTORY_MINUTES = 60*2;

class ProgramView {
	constructor() {
		this.el = redom.el('div.screenPart#program',
			redom.el('div.header#programHeader', 'Ohjelmaa'),
			this.placesList = redom.list('div.programDivider#places', ProgramPlace),
			redom.el('div#programScroller',
				// redom.el('div#arrow', 'Nyt ->'),
				this.currentTimeIndicator = redom.el('div#currentTimeIndicator'),
				this.columns = redom.list('div.programDivider#programContent', ProgramColumn),
			)
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
		this.el = redom.el('div.programCell')
	}
	update(programEntry) {
		programEntry.timestamp = new Date(programEntry.timestamp);
		programEntry.endTime = new Date(programEntry.endTime);

		let formattedTime = formatTime(programEntry.timestamp) + ' - ' + formatTime(programEntry.endTime);


		this.el.innerHTML = formattedTime + '<br>' + programEntry.name;
		let duration = programEntry.durationMinutes;
		let portionOfView = duration / VIEW_DURATION_MINUTES * 100

		this.el.style.top = getTopValue(programEntry.timestamp);
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
