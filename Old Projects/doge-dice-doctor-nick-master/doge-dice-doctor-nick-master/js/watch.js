var now = 0;
var start_time = 0;
var check_time = 0;
var version_c = 1;
var last_betid = 0;

var time_delay_check_value = 20; //change this to alter the delay value in seconds

function checkbox() {
	var $o_row1 = $('<div class="row"/>');
	$footer = $('<div style="position:fixed;bottom:0px;background-color:white;">Bot version ' + version_c + '</div>');

	$bot_c = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="bot_check" id="bot_check" checked="checked" /> Watcher</font></div>')
		$o_row1.append($bot_c);

	$(".chatstat").append($o_row1);
	$("body").append($footer);
}

function anti_idle() {
	setInterval(function () {
		if ($("#reconnect").is(':visible')) {
			$("#reconnect").click();
		}
    now = (Date.now() / 1000).toFixed(0);
	}, 100);
}

function results() {
	var results = $("div#me .results")[0];
	var result = $(results).children()[0];
	var betid = $($(result).children(".betid")).text();
	var balance = parseFloat($("#pct_balance").val());
    check_time = now - start_time;

	if (betid != last_betid) {
		last_betid = betid;

		var win = ($($(result).children(".profit")).text()[0] == "+");
		if (win) {
            
			start_time = now;
		} else {
			start_time = now;
		}

	}

}

function watchem() {

	setInterval(function () {
    
        results();

		if ($('#bot_check').prop('checked')) {
			check_time = now - start_time;
			if (check_time >= time_delay_check_value) {
				$("#a_hi").trigger('click');
                console.log('charging at 10000 m/j:  CLEAR!!! ' + check_time + '\n');
                setTimeout(function() { console.log('5'); },1000)
                setTimeout(function() { console.log('4'); },2000)
                setTimeout(function() { console.log('3') },3000)
                setTimeout(function() { console.log('2') },4000)
                setTimeout(function() { location.reload(); },5000)
			}
		}

	}, 1000);

}

$(document).ready(function () {

	anti_idle();
	checkbox();
	start_time = now;
    watchem();

});