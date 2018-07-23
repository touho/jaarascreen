
function decided() {
    send();
}

var timery = null;
function send() {
    clearTimeout(timery);
    timery = null;

    $('#status').text('...');

    $.ajax({
        type: 'POST',
        url: '/progeda/deciderDecides'
    }).done(function (results) {
        $('#status').text('Joke!');
        timery = setTimeout(function ()  {
            $('#status').text('No joke.');
        }, 5000);
    }).catch(function (err) {
        alert('fail');
    });
}


window.onkeydown = function (e) {
    if (e.keyCode === 32) {
        send();
    }
}

function refresh() {
    $.ajax({
        type: 'GET',
        url: '/progeda/getData'
    }).done(function (results) {
        console.log(results);
        build(results);
    }).catch(function (err) {
        console.log(err);
    });
}

setInterval(refresh, 1000);

function build(data) {
    var names = Object.keys(data);

    var datas = names.map(function (name) {
        return data[name];
    });

    datas.sort(function (a, b) {
        if (score(a) < score(b)) {
            return 1;
        } else if (score(a) > score(b)) {
            return -1;
        } else {
            return 0;
        }
    });

    tablebody.innerHTML = '';
    datas.forEach(function (data, i) {
        $(tablebody).append($('<tr>')
        .append($('<td>').text('#' + (i+1)))
            .append($('<td>').text(data.name))
            .append($('<td>').text(data.correct))
            .append($('<td>').text(data.fails))
        );
    });
}

function score(user) {
    return user.correct - user.fails;
}
