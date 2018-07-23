
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
