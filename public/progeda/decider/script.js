
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
    }).done(function(results) {
        $('#status').text('Joke!');
        timery = setTimeout(function() {
            $('#status').text('No joke.');
        }, 5000);
    }).catch(function(err) {
        alert('fail');
    });
}


window.onkeydown = function(e) {
    if (e.keyCode === 32) {
        send();
    }
}

function resetData() {
    $.ajax({
        type: 'POST',
        url: '/progeda/resetData'
    }).done(function(results) {
        console.log(results);
    }).catch(function(err) {
        alert('fail');
    });
}