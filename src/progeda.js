var bodyParser     =        require("body-parser");

let progeda = module.exports;

progeda.start = function(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    let isJokeTime = false;

    app.post('/progeda/tajusin', async function (req, res) {
        let nick = req.body.nick;
        if (!nick) {
            return err(res, 'Sinulla ei ole nimeä.');
        }
        if (isJokeTime) {
            res.send('Tajusit oikein!!');
        } else {
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

}

function err(res, msg) {
    res.status(400);
    res.send(msg);
}
