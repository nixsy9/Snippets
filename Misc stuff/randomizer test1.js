function randomString() {
        var chars = "0123456789";
        var string_length = 24;
        var randomstring = '';
        for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
        }
        random_string = randomstring;
}
 
function randomizer() {
        randomString();
        $("#a_random").trigger('click');                
        console.log('random string: ' + random_string);
        var $new_randomize = $('<button id="new_randomize" onClick=\'javascript:socket.emit("seed", csrf, "' + (random_string) + '", true);\'></button>');
        $($footer).append($new_randomize);
        $("#new_randomize").trigger('click');
        $new_randomize.remove();
}