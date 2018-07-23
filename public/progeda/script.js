
var nick = '';
function build() {
    body.innerHTML = '';

    if (!nick) {
        buildNickEnter();
    } else {
        buildButton();
    }
}

function buildNickEnter() {
    var input = $('<input class="myName">').text('').attr({placeholder: 'Nimesi'}).appendTo(body);
    $('<button class="nameOk">').text('OK').appendTo(body).click(function() {
        var val = input.val().trim();
        if (val) {
            nick = val;
            build();
        }
    });
}


var timery = null;

function buildButton() {
    $(body).append($('<div class="myNickViewer">').text(nick));
    $(body).append($('<button class="tajusinButton">').text('Tajusin').click(function() {
        clearTimeout(timery);
        timery = null;

        $('div.feedback').remove();
        $('<div class="feedback sending">').text('...').appendTo(body);
        // ajax
        $.ajax({
            type: 'POST',
            url: '/progeda/tajusin',
            data: {
                nick: nick,
            }
        }).done(function(results) {
            $('div.feedback').remove();
            $('<div class="feedback correct">').text(results).appendTo(body);
            timery = setTimeout(function() {
                $('div.feedback').remove();
            }, 2000);
        }).catch(function(err) {
            $('div.feedback').remove();
            $('<div class= "feedback fail">').text(err.responseText).appendTo(body);
            timery = setTimeout(function() {
                $('div.feedback').remove();
            }, 2000);
        });
    }));
}

$(build);
