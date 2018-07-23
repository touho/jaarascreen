var bodyParser     =        require("body-parser");

let progeda = module.exports;

progeda.start = function(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    let isJokeTime = false;

    let data = {};

    app.post('/progeda/tajusin', async function (req, res) {
        let nick = req.body.nick;
        if (!nick) {
            return err(res, 'Sinulla ei ole nimeä.');
        }
        if (!data[nick]) {
            data[nick] = {
                name: nick,
                correct: 0,
                fails: 0
            };
        }

        let user = data[nick];

        if (isJokeTime) {
            user.correct++;
            res.send('Tajusit oikein!!');
        } else {
            user.fails++;
            err(res, 'Tajusit väärin..');
        }
    });

    let timery = null;
    app.post('/progeda/deciderDecides', async function (req, res) {
        clearTimeout(timery);
        timery = null;

        isJokeTime = true;

        timery = setTimeout(() => {
            isJokeTime = false;
        }, 5000);

        res.send('OK');
    });

    app.get('/progeda/getData', async function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    });

    app.post('/progeda/resetData', function(req, res) {
        data = {};
        res.send('OK');
    });

}

function err(res, msg) {
    res.status(400);
    res.send(msg);
}
