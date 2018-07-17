let fs = require('fs');
let ical = require('ical');
const ICAL_FILENAME = process.env['ICAL_FILENAME'];
let program = {};
module.exports = program;
if (ICAL_FILENAME) {
    let data = ical.parseFile(ICAL_FILENAME);
    let googleDriveData = [];
    let eventKeys = Object.keys(data);

    for (let eventKey of eventKeys) {
        let event = data[eventKey];
        if (event.type !== 'VEVENT') {
            continue;
        }
        let place = event.location;
        let name = event.summary;

        let start = new Date(event.start);
        let end = new Date(event.end);
        let durationMinutes = Math.round((end.getTime() - start.getTime()) / 1000 / 60);

        if (!program[place]) {
            program[place] = [];
        }

        program[place].push({
            timestamp: start,
            durationMinutes,
            place,
            name,
            endTime: end
        });

        googleDriveData.push([
            start.getFullYear(),
            start.getMonth() + 1,
            start.getDate(),
            start.getHours(),
            start.getMinutes(),
            durationMinutes,
            place,
            name
        ].join(';'));
    }

    fs.writeFileSync('calendar.csv', googleDriveData.join('\n'));
    console.log('iCal file parsed and written to calendar.csv');
}
