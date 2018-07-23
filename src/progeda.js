var bodyParser     =        require("body-parser");

let progeda = module.exports;

progeda.start = function(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.post('/progeda/tajusin', async function (req, res) {
        let nick = req.body.nick;
        if (!nick) {
            return err(res, 'Sinulla ei ole nimeä.');
        }
        // return err(res, 'kekki');
        res.send('Tajusit oikein!!');
    });

}

function err(res, msg) {
    res.status(400);
    res.send(msg);
}
