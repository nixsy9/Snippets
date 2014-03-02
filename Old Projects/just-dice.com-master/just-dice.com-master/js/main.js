//Copyright (C) 2013  CriticalNix
//
//This program is free software; you can redistribute it and/or
//modify it under the terms of the GNU General Public License
//version 2.
//
//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//GNU General Public License for more details.
//
//A full copy of the GNU General Public License, version 2 can be found here. http://www.gnu.org/licenses/gpl-2.0.html
//-------------------------------------------------------------------
var coin_url = chrome.extension.getURL('snd/coin-drop-1.mp3');
var beep_url = chrome.extension.getURL('snd/beep-7.mp3');
var fate_url = chrome.extension.getURL('snd/Fatality.mp3');
var coin_drop = new Audio(coin_url);
var snd_beep = new Audio(beep_url);
var snd_alert = new Audio(fate_url);
var animate_image = chrome.extension.getURL('img/animate.png');
var icon_imgage = chrome.extension.getURL('img/icon.png');
var background_imgage = chrome.extension.getURL('img/div_container_1.png');
var nix_image = chrome.extension.getURL('img/N6n5UNz.png');
var emote_imgage = chrome.extension.getURL('img/emote');
var winning = 2; // 1 = winning 0 = losing
var round_length = 0; // holds the amount of times we can multiply.
var running = 0; //running 1 is working.
var run_round = 0;
var betting = 0; //1 = making bet.
var start_balance = 0;
var balance = 0;
var start_values_check = 0;
var betid = 0;
var last_betid = 0;
var version_c = "3.0.4";
var heartbeat_bpm = 100; //this is the bots ticker if for some reason the site temp bans  for spam betting lower this to 125
var bet_data = [];
var arr_bets = [];
var current_time = 1;
var start_time = 0;
var start_bet = 0;
var current_bet = 0;
var won = 0;
var lost = 0;
var win1 = 0;
var lose1 = 0;
var steps = 0;
var max_win = 0;
var max_loss = 0;
var marti_limit = 0;
var betid_check = 0;
var reset_bet = 0;
var start_bal = 0;
var first_run = 0;
var current_profit = 0;
var hi_lo;
var randomizer_count = 0;
var randomizing = 0;

//window.location.reload(true);
//-------------------------------------- Heart and possibly soul of the bot. Everything is called from here.
function heart_beat() {
	gui();
	footer();
	parse_chat();
	stop_bank();

	console.log(' Started ' + gets_date() + ' Heartbeat:' + heartbeat_bpm + '\n' + '\n');

	setInterval(function () {
		value_grip();
		results();
		stats_update();
		total_check();
		Martingale();
		max_loss_streak();
		max_win_streak();

	}, heartbeat_bpm);
}

//-------------------------------------- increments max loss and max win display 
function max_loss_streak() { // longest loss streak
	$("#maxLossInput").css("color", "red");
	setInterval(function () {
		if (lose1 > max_loss) {
			max_loss++;
			$("#maxLossInput").val(max_loss);
		} else {
			// nothing here move along XD
		}
	}, 100);
}

function max_win_streak() { //longest win streak
	$("#maxWinInput").css("color", "green");
	setInterval(function () {
		if (win1 > max_win) {
			max_win++;
			$("#maxWinInput").val(max_win);
		} else {
			// nothing here move along XD
		}
	}, 100);
}

function stop_bank() {
	setInterval(function () {
		if ($('#profit_stop_check').prop('checked')) {
		var bal_checked = parseFloat($("#pct_balance").val());
		var stop_bank = parseFloat($("#stop_bank").val());
			if (bal_checked >= stop_bank) {
				running = 0;
			}
		}
	}, 100);
}

//-------------------------------------- Randomizer function.
function randomizer() {
	if ($('#randomizer_check').prop('checked') && randomizer_count >= 12) { 
		randomizer_count = 0;
		randomizing = 1;
		$("button#a_random").click();
		running = 0;
		setTimeout(function() {
	 		$("button.seed_button").click();
	 		running = 1;
	 		randomizing = 0; 
		}, 1000)
	}	
}

//-------------------------------------- Unused for now but will be used in future updates.
function randomString(length) {
        var chars = "0123456789";
        var string_length = length;
        var randomstring = '';
        for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
}

function reset_stats() {
	start_balance = parseFloat($("#pct_balance").val());
	won = 0;
	win1 = 0;
	lose1 = 0;
	steps = 0;
	run_round = 0;
	lost = 0;
	max_win = 0;
	$("#maxWinInput").val(max_win);
	max_loss = 0;
	$("#maxLossInput").val(max_loss);
	cBust3 = 0;
	stats_update();
}

//-------------------------------------- gathers results and increments counters
function results() {
	var results = $("div#me .results")[0];
	var result = $(results).children()[0];
	var betid = $($(result).children(".betid")).text();
	balance = parseFloat($("#pct_balance").val());

	if (betid != last_betid) {
		last_betid = betid;

		var win = ($($(result).children(".profit")).text()[0] == "+");
		//console.log('win:' + win + '\n');
		if (win) {
			won++;
			win1++;
			lose1 = 0;
			steps = 0;
			winning = 1;
			run_round++;
			betting = 0;
			if ($('#stopwin_check').prop('checked')) { // checks to see if stop on win is checked
				running = 0;
			}
			update_graphs();
			play_sound1();
			popArray();
			randomizer_count++;

		} else {
			win1 = 0;
			lose1++;
			steps++;
			lost++;
			winning = 0;
			run_round++;
			hi_lo = !hi_lo;
			betting = 0;
			update_graphs();
			play_sound2();
			popArray();
			randomizer_count++;
			if (first_run == 0) {
				lose1--;
				steps--;
				run_round--;
				lost--;
				first_run = 1;
			}

		}

	}

}

//-------------------------------------- Invest function
function invest(value) {

		var invest_send = $('<button id="invest_all" style="width:80px;margin-right:10px;border:1px solid" onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", ' + value + ');\'></button>');

		$($footer).append(invest_send);
		$("#invest_all").trigger('click');
		invest_send.remove();
			
		console.log('invested:' + value + '\n')

}

//-------------------------------------- probability and stat's update
function stats_update() {
	//probability
	var ccbust1 = parseFloat($("#pct_chance").val());
	var ccbust2 = parseFloat($("#limiter").val());
	var cBust3 = 0;
	cBust1 = 1 - ccbust1 / 100;
	cBust2 = Math.pow(cBust1, ccbust2) * 100;

	if (cBust3 != cBust2) {
		cBust3 = cBust2;

		scientific(cBust2);

		$("#probability").val(cBust2.toFixed(10));
	}

	//betsInput ---total bets
	$("#betsInput").val(run_round);

	//profitInput ---profit  -- start_bal
	balance = parseFloat($("#pct_balance").val());
	current_profit = balance - start_balance;
	$("#profitInput").val(current_profit.toFixed(8));

	var win_ratio = ((won / run_round) * 100);
	if (isNaN(win_ratio)){
		win_ratio = 0;
	}
	$("#percentWonInput").val(win_ratio.toFixed(8));

	if ($("#reconnect").is(':visible')) { //Thanks 'eltopo' prevents user timeout.
		$("#reconnect").click();
	}
}

//-------------------------------------- Populates bet array with information then offers to save on bust
function save_to_file() {
	window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024, function (fs) {
		fs.root.getFile('open-with-notepad.bin', {
			create : true
		}, function (fileEntry) {
			fileEntry.createWriter(function (fileWriter) {

				var blob = new Blob([arr_bets]);

				fileWriter.addEventListener("writeend", function () {
					// navigate to file, will download
					location.href = fileEntry.toURL();
				}, false);

				fileWriter.write(blob);
			}, function () {});
		}, function () {});
	}, function () {});
}


function popArray() { //populate bet array
	var results = $("div#me .results")[0];
	var result = $(results).children()[0];
	var betid = $($(result).children(".betid")).text();
	var c_balance = parseFloat($("#pct_balance").val());
	var c_chance = parseFloat($("#pct_chance").val());
	var arr_bet = parseFloat($("#pct_bet").val());

	arr_bets.push('\n');
	arr_bets.push(gets_date() + '   ');
	arr_bets.push('Bet number:' + run_round + '   ');
	arr_bets.push('betid:' + betid + '   ');
	arr_bet1 = scientific(arr_bet);
	arr_bet2 = parseFloat(arr_bet1).toFixed(8);	
	arr_bets.push('bet amount:' + arr_bet2 + '   ');
	arr_bets.push('Balance:' + c_balance + '   ');
	arr_profit = scientific(current_profit);
	arr_profit2 = parseFloat(arr_profit).toFixed(8);
	arr_bets.push('profit:' + arr_profit2 + '   ');
	arr_bets.push('chance:' + c_chance + '   |');
}

//-------------------------------------- Show version in footer
function footer() {
	$footer = $('<div style="position:fixed;bottom:0px;background-color:White;">v' + version_c + '</div>');
	$("body").append($footer);
}

//-------------------------------------- Grabs single instance values
function value_grip() {
	if (start_values_check == 0) { 
		start_balance = parseFloat($("#pct_balance").val());
		if (isNaN(start_balance)) {
			console.log('start_balance ...Loading' + '\n');
		} else if (start_balance > 0.00000001) {
			start_values_check = 1;
			console.log('start balance found: ' + start_balance + '\n');
		}
	}

}

//-------------------------------------- Martingale Function
function Martingale() {
	// pass bet value here bet_click(bet_value)
	if (running == 1) {
		if (winning == 1 && betting == 0) {

			randomizer();
			bet_click(reset_bet);

		} else if (winning == 0 && betting == 0) {

			var new_bet = parseFloat($("#pct_bet").val() * $multiplierInput.val());

			randomizer();
			bet_click(new_bet);

		} else {

			//console.log('martingale else');
		}
	}
}

//-------------------------------------- bets from a value passed to it if it has not reached step limiter. Also switch on loss and random hi lo
function bet_click(bet_value) {
	var rndhilo = Math.random() < 0.5 ? 1 : 0;
	var marti_limit = parseFloat($("#limiter").val());
	var marti_reset_value = parseFloat($("#reset_value").val()); //value to reset to
	var marti_reset_step = parseFloat($("#reset_step").val()); //step number to reset to
	        

	if (steps == (marti_reset_step - 1) && betting == 0 && running == 1 && $('#resetL_check').prop('checked')) {
		if ($('#switch_loss_check').prop('checked')) {
			if (hi_lo) {
				betting = 1;
				marti_reset_value = scientific(marti_reset_value);
				$("#pct_bet").val(marti_reset_value);
				$("#a_hi").trigger('click');

			} else {
				betting = 1;
				marti_reset_value = scientific(marti_reset_value);
				$("#pct_bet").val(marti_reset_value);
				$("#a_lo").trigger('click');
			}
		} else {

			betting = 1;
			marti_reset_value = scientific(marti_reset_value);
			$("#pct_bet").val(marti_reset_value);

			$("#a_hi").trigger('click');
		}
	} else if (steps < marti_limit && betting == 0 && running == 1) {
		if ($('#switch_loss_check').prop('checked')) {
			if (hi_lo) {
				betting = 1;
				bet_value = scientific(bet_value);
				$("#pct_bet").val(bet_value);
				$("#a_hi").trigger('click');

			} else {
				betting = 1;
				bet_value = scientific(bet_value);
				$("#pct_bet").val(bet_value);
				$("#a_lo").trigger('click');
			}
		} else {

			betting = 1;
			bet_value = scientific(bet_value);
			$("#pct_bet").val(bet_value);

			$("#a_hi").trigger('click');
		}
	} else if (randomizing == 1) {
			console.log('Randomizing Please wait....');
		} else {
			bust();
	}
}

function bust() {
	log_message('***limit reached***');
	console.log('***limit reached***');
	steps = 0;
	running = 0;
	$("#pct_bet").val(reset_bet);
	play_sound3();
}

//-------------------------------------- Graphing functions
function generate_graph() {
	var res = [];
	for (var i = 0; i < bet_data.length; ++i) {
		if (res.length >= 201) {
			res.shift();
			res.push([i, bet_data[i]])
		} else {
			res.push([i, bet_data[i]])
		}
	}

	return res;
}

function update_graphs() {
	var g_bal = $('#pct_balance').val();

	if (bet_data.length >= 201) {
		bet_data.shift();
		bet_data.push(g_bal);
	} else {
		bet_data.push(g_bal);
	}

	var plot = $.plot("#g_placeholder", [generate_graph()], {
			series : {
				color : '#cdffcc'
			},
			yaxis : {},
			xaxis : {}
		});

	plot.setData([generate_graph()]);

	plot.setupGrid();
	plot.draw();
	//console.log('data' + bet_data)
}

//---------------------------------------------------------------------------- builds user interface

//-------------------------------------- Opens help html
function basicPopup(url) {
	popupWindow = window.open(url,'popUpWindow','height=500,width=500,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes');
}

function gui() { //

	//-------------------------------------- Invest all and divest all buttons
	$('.button_inner_group:nth(2)').append(
		       '<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", $("#invest_code").val());\'>invest all<div class="key">N</div></button>').append(
		       '<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("divest", csrf, "all", $("#divest_code").val());\'>divest all<div class="key">M</div></button>');

	//-------------------------------------- Options
	var $o_row1 = $('<div class="row"/>');

	//sound_check
	$sound_c = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="sound_check" id="sound_check" /> Play sound on win! </font></div>')
		$o_row1.append($sound_c);

	//sound_check2
	$sound_check2 = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="sound_check2" id="sound_check2" /> Play sound on loss! </font></div>')
		$o_row1.append($sound_check2);

	//sound_check3
	$sound_check3 = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="sound_check3" id="sound_check3"  /> Play sound on bust! </font></div>')
		$o_row1.append($sound_check3);
		
	//stopwin_check
	$swin_c = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="stopwin_check" id="stopwin_check" /> Stop on win</font></div>')
		$o_row1.append($swin_c);
    
	//smile_check
    $smile_c = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="smile_check" id="smile_check" checked="checked" /> Chat smileys on  </font></div>')
        $o_row1.append($smile_c);

	//switch_loss_check
	$switch_loss_check = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="switch_loss_check" id="switch_loss_check" /> switch hi/lo on loss </font></div>')
		$o_row1.append($switch_loss_check);
		
	//resetL_check
	$reset_loss_safety = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="resetL_check" id="resetL_check" /> check to enable reset step </font></div>')
		$o_row1.append($reset_loss_safety);
		
    //profit_stop_check
    $profit_stop_check = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="profit_stop_check" id="profit_stop_check" /> stop on bank  </font></div>')
        $o_row1.append($profit_stop_check);

    //randomizer_check
    $randomizer_check = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="randomizer_check" id="randomizer_check" /> randomize every 12  </font></div>')
        $o_row1.append($randomizer_check);
        
	//-------------------------------------- builds user interface
	$container = $('<div id="chipper" class="container"/>');
	$container2 = $('<div id="chipper2" class="container"/>');

	var $container2 = $('<div id="chipper2" class="container"/>');
	var $button_group = $('<div style="width:99%;background-image: url(' + background_imgage + ') ;border:2px solid; border-color: #525252;" class="button_group"/>');
	var $options_group = $('<div style="background-image: url(' + background_imgage + ') ;border:2px solid; border-color: #505050;" class="button_group"/>');
	$container.append($button_group);
	//$container2.append($options_group)

	var $martingale_button = $('<button class="button_label chance_toggle" style="margin-top:27px;margin-right:0px;height:65px;;width:70px;color:transparent;background-color:transparent;border:none;"><img src="' + icon_imgage + '"></button>');
	$martingale_button.click(function () {
		//-----
		console.log('button clicked')
		//-----
	});

	  var $run_div = $('<div background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;" class="button_inner_group"/>');

	//-------------------------------------- Outer UI buttons
	  $run = $('<button id="c_run" style="color:green;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px">Go</button>');
	$run.click(function () {
		//-----
		//Start function
		//-----
		reset_bet = parseFloat($("#pct_bet").val());
		running = 1;
		console.log('running = 1' + '\n' + 'Start bet:' + scientific(reset_bet))
	});
	  $run_div.append($run);
	    
	  $Stop = $('<button id="c_stop" style="color:red;margin-bottom:5px;margin-top:5px;height:22px">Stop</button>');
	  $Stop.click(function () {
		//-----
		//Stop function
		//-----
		running = 0;
		console.log('running = 0' + '\n')
		steps = 0;
	});

	  $run_div.append($Stop);

	$reset = $('<button title="no function yet" style="margin-right:10px;border:1px solid" id="fleft chatbutton" >reset stats</button>');
	  $reset.click(function () {
		//-----
		reset_stats();
		//----- 
	});
	  $container.append($reset);

	$showhidetrigger3 = $('<button title="Toggles bot graph" style="margin-right:10px;border:1px solid" id="showhidetrigger3" href="#">graph</button>'); //toggle hide for graph
	  $showhidetrigger3.click(function () {
		$('#chipper3').toggle(500);
		//update_graphs();
		$.plot($("#g_placeholder"), [[]]);
	});
	  $container.append($showhidetrigger3);

	$showhidetrigger4 = $('<button title="Toggles bot option gui" style="margin-right:10px;border:1px solid" id="showhidetrigger4" href="#">options</button>'); //toggle hide for options
	  $showhidetrigger4.click(function () {
		$('#chipper5').toggle(500);
	});
	  $container.append($showhidetrigger4);
	
	$showhidetrigger5 = $('<button title="Toggles bot option gui" style="margin-right:10px;border:1px solid" id="showhidetrigger5" href="#">save</button>'); //toggle hide for options
	  $showhidetrigger5.click(function () {
		save_to_file();
	});
	  $container.append($showhidetrigger5);

	$showhidetrigger6 = $('<button title="Much Help" style="margin-right:10px;border:1px solid" id="showhidetrigger6" href="#">HELP</button>'); //Popup help
	  $showhidetrigger6.click(function () {
		
		var help_p ="https://googledrive.com/host/0BywRa_utENFgV0ZBNmdVRTJ0a0k/DD.html ";
		basicPopup(help_p);
	});
	  $container.append($showhidetrigger6);	

	//-------------------------------------- Inner UI input boxes
	var $row1a = $('<div class="row"/>'); ////////////////////////////////////// row 1a

	  var $limiter = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Steps</p>');
	  $limiterInput = $('<input style="border:1px solid; border-color: #505050;" id="limiter" value="0"/>');
	  var $limiterEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row1a.append($limiter);
	  $row1a.append($limiterInput);
	  $row1a.append($limiterEnd);

	var $row1b = $('<div class="row"/>'); ////////////////////////////////////// row 1b

	  var $multiplier = $('<p style="border:1px solid; border-color: #505050;" class="llabel">multiplier</p>');
	  $multiplierInput = $('<input style="border:1px solid; border-color: #505050;" id="multiplier" value="0"/>');
	var $multiplierEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">x</p>');
	  $row1b.append($multiplier);
	  $row1b.append($multiplierInput);
	$row1b.append($multiplierEnd);

	var $row1c = $('<div class="row"/>'); ////////////////////////////////////// row 1c

	  var $required_bank = $('<p style="border:1px solid; border-color: #505050;" class="llabel">required </p>');
	  $required_bankInput = $('<input style="border:1px solid; border-color: #505050;" id="required_bank" class="readonly" value="0"/>');
	var $required_bankEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	  $row1c.append($required_bank);
	  $row1c.append($required_bankInput);
	$row1c.append($required_bankEnd);
	
	var $row1d = $('<div class="row"/>'); ////////////////////////////////////// row 1d

	  var $reset_step = $('<p style="border:1px solid; border-color: #505050;" class="llabel">reset step</p>');
	  $reset_stepInput = $('<input style="border:1px solid; border-color: #505050;" id="reset_step" value="0"/>');
	var $reset_stepEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row1d.append($reset_step);
	  $row1d.append($reset_stepInput);
	$row1d.append($reset_stepEnd);

	  var $row2a = $('<div class="row"/>'); ////////////////////////////////////////////// row 2a

	  var $maxLoss = $('<p style="border:1px solid; border-color: #505050;" class="llabel">loss streak</p>');
	  $maxLossInput = $('<input style="border:1px solid; border-color: #505050;" id="maxLossInput" class="readonly" value="0"/>');
	  var $maxLossEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row2a.append($maxLoss);
	  $row2a.append($maxLossInput);
	  $row2a.append($maxLossEnd);

	var $row2b = $('<div class="row"/>'); ////////////////////////////////////////////// row 2b

	  var $maxWin = $('<p style="border:1px solid; border-color: #505050;" class="llabel">win streak</p>');
	  $maxWinInput = $('<input style="border:1px solid; border-color: #505050;" id="maxWinInput" class="readonly" value="0"/>');
	var $maxWinEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row2b.append($maxWin);
	  $row2b.append($maxWinInput);
	$row2b.append($maxWinEnd);

	var $row2c = $('<div class="row"/>'); ////////////////////////////////////// row 2c

	  var $percentWon = $('<p style="border:1px solid; border-color: #505050;" class="llabel">win ratio</p>');
	  $percentWonInput = $('<input style="border:1px solid; border-color: #505050;" id="percentWonInput" class="readonly" value="0"/>');
	var $percentWonEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	  $row2c.append($percentWon);
	  $row2c.append($percentWonInput);
	$row2c.append($percentWonEnd);
	
	var $row2d = $('<div class="row"/>'); ////////////////////////////////////// row 2d

	  var $reset_value = $('<p style="border:1px solid; border-color: #505050;" class="llabel">reset val</p>');
	  $reset_valueInput = $('<input style="border:1px solid; border-color: #505050;" id="reset_value" value="0.00000000"/>');
	var $reset_valueEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	  $row2d.append($reset_value);
	  $row2d.append($reset_valueInput);
	$row2d.append($reset_valueEnd);

	var $row3a = $('<div class="row"/>'); ///////////////////////////////// row 3a

	  var $bets = $('<p style="border:1px solid; border-color: #505050;" class="llabel">total bets</p>');
	  $betsInput = $('<input style="border:1px solid; border-color: #505050;" id="betsInput" class="readonly" value="0"/>');
	  var $betsEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row3a.append($bets);
	  $row3a.append($betsInput);
	  $row3a.append($betsEnd);

	var $row3b = $('<div class="row"/>'); ///////////////////////////////// row 3b

	var $probability = $('<p style="border:1px solid; border-color: #505050;" class="llabel">probability</p>');
	  $probabilityInput = $('<input style="border:1px solid; border-color: #505050;" id="probability" class="readonly" value="0"/>');
	  var $probabilityEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	  $row3b.append($probability);
	  $row3b.append($probabilityInput);
	  $row3b.append($probabilityEnd);

	var $row3c = $('<div class="row"/>'); ////////////////////////////////////////////// row 3c

	  var $profit = $('<p style="border:1px solid; border-color: #505050;" class="llabel">profit</p>');
	  $profitInput = $('<input style="border:1px solid; border-color: #505050;" id="profitInput" class="readonly" value="0.00000000"/>');
	var $profitEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	  $row3c.append($profit);
	  $row3c.append($profitInput);
	$row3c.append($profitEnd);
	
	var $row3d = $('<div class="row"/>'); ////////////////////////////////////////////// row 3d

	  var $stop_bank = $('<p style="border:1px solid; border-color: #505050;" class="llabel">stop bank</p>');
	  $stop_bankInput = $('<input style="border:1px solid; border-color: #505050;" id="stop_bank" value="0.00000000"/>');
	var $stop_bankEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	  $row3d.append($stop_bank);
	  $row3d.append($stop_bankInput);
	$row3d.append($stop_bankEnd);

	//-------------------------------------- Graph Div
	var $graphDiv = $('<fieldset id="chipper3" style="margin-left:70px;background-color:rgba(35,35,35,0.9);border:2px solid; border-color: #999999;width:700px;height:100px;margin-right:3px" class="graph-container"><div style="padding: 0;width:700px;height:100px;margin-right:0px" id="g_placeholder" class="graph-placeholder"></div>'); //graph holder


	//-------------------------------------- Putting it all together
	var $fieldset_o = $('<fieldset style="background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	  

	var $fieldset = $('<fieldset style="margin-left:auto;margin-right:2px;background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	$fieldset.append($row1a);
	$fieldset.append($row1b);
	$fieldset.append($row1c);
	$fieldset.append($row1d);

	var $fieldset2 = $('<fieldset style="margin-left:auto;margin-right:2px;background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	$fieldset2.append($row2a);
	$fieldset2.append($row2b);
	$fieldset2.append($row2c);
	$fieldset2.append($row2d);

	var $fieldset3 = $('<fieldset style="margin-left:auto;margin-right:2px;background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	$fieldset3.append($row3a);
	$fieldset3.append($row3b);
	$fieldset3.append($row3c);
	$fieldset3.append($row3d);

	var $fieldset4 = $('<fieldset style="margin-left:auto;margin-right:auto;background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	$fieldset4.append($run_div);

	var $fieldset_o = $('<div id="chipper5" style="margin-top:8px;background-image:url(' + background_imgage + ') ;border:2px solid; border-color: #505050;" class="button_group"/>');
	$fieldset_o.append($o_row1);

	$button_group.append($martingale_button);
	$button_group.append($fieldset);
	$button_group.append($fieldset2);
	$button_group.append($fieldset3);
	$button_group.append($fieldset4);
	$button_group.append($graphDiv);
	$button_group.append("<div align='center' style='color:white;font-size:10pt;'>Enhancement suite V3</div>");
	$container.append($fieldset_o);

	///////////////////////////////// chat base buttons ////////////////////////////////////////

	var $chat_send = $('div#chat .chatbase:last-child') //location of chatbase

		var $chat_button_group = $('<div style="width:675px;background-color:#787878 ;border:2px solid; border-color: #505050;" />');

	$button1 = $('<button title="Button1" style="width:80px;margin-right:10px;border:1px solid" id="button1" >Button1</button>');
	  $button1.click(function () {});
	  $chat_button_group.append($button1);

	$chat_send.append($chat_button_group);

	/////////////////////////////////////////////////////////////////////////////////////////////////


	//-------------------------------------- Add ui elements to page
	$(".chatstat").append('<a title="Toggles bot gui" id="showhidetrigger" href="#"><font color="blue">Show Bot</font></a>'); //toggles hide for gui
	  $(".chatstat").append($container);
	 $(".chatstat").append('<div style="clear:left;"/>');

	//-------------------------------------- Hide Graph and options Div
	$(document).ready(function () { // toggle hide function for graph
		$('#chipper3').hide();
		$('#chipper5').hide();
	});

	//-------------------------------------- Add toggle for UI
	$(document).ready(function () { // toggle hide function for gui
		$('#chipper').hide();
		$('a#showhidetrigger').click(function () {
			$('#chipper').toggle(500);
		});
	});

}

//-------------------------------------- grabs date in readable format
function gets_date() {
	var now = new Date();
	var strDateTime = [[AddZero(now.getDate()), AddZero(now.getMonth() + 1), now.getFullYear()].join("/"), [AddZero(now.getHours()), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");

	function AddZero(num) {
		return (num >= 0 && num < 10) ? "0" + num : num + "";
	}
	return strDateTime;
}

//-------------------------------------- sleep function
function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

//-------------------------------------- scientific notation
function scientific(x) {
	if (Math.abs(x) < 1.0) {
		var e = parseInt(x.toString().split('e-')[1]);
		if (e) {
			x *= Math.pow(10, e - 1);
			x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
		}
	} else {
		var e = parseInt(x.toString().split('+')[1]);
		if (e > 20) {
			e -= 20;
			x /= Math.pow(10, e);
			x += (new Array(e + 1)).join('0');
		}
	}
	return x;
}

//-------------------------------------- starts on page load
$(document).ready(function () {

	console.log('Welcome to the Enhancement suite V3');
	log_message('Welcome to the Enhancement suite V3');
	console.log('\n');
	heart_beat();


});

function total_check() { //logic and check if bot has enough bank for martingale

	if ($multiplierInput !== undefined &&   $limiterInput !== undefined)
		if ($.isNumeric($multiplierInput.val()) && $.isNumeric($limiterInput.val()) && $.isNumeric($('#pct_bet').val())) {

			var total = 0;
			var mult = 1;
			var i;

			for (i = 0; i < $limiterInput.val(); i++) {
				total += $('#pct_bet').val() * mult; //total = total + $('#pct_bet').val() * mult;
				mult *= $multiplierInput.val(); //mult = mult * $multiplierInput.val();			           
			}

			//console.log('total bank needed for martingale:' + total);

			$("#required_bank").val(total.toFixed(8));

			if (total != 0 && total < $('#pct_balance').val()) {
				// Good to go           
			} else {
				// not enough balance           
			}
			      
		} else {
			//something is missing      
		}
}

//-------------------------------------- Post message in the log area
function log_message(message) { 
	document.querySelector(".log").innerHTML = (message);
	setInterval(function () {
		document.querySelector(".log").innerHTML = " ";
	}, 6000);
}

//-------------------------------------- Win sound
function play_sound1() { 
	if ($('#sound_check').prop('checked')) {
		snd_alert.pause();
		snd_beep.pause();
		coin_drop.play();
		coin_drop.currentTime = 0;
	} else {
		return;
	}
}

//-------------------------------------- Lose sound
function play_sound2() {
	if ($('#sound_check2').prop('checked')) {
		snd_alert.pause();
		coin_drop.pause();
		snd_beep.play();
		snd_beep.currentTime = 0;
	} else {
		return;
	}
}

//-------------------------------------- Bust sound
function play_sound3() {
	if ($('#sound_check3').prop('checked')) {
		snd_beep.pause();
		coin_drop.pause();
		snd_alert.play();
		snd_alert.currentTime = 0;
		alert("Bot has bust !!");
	} else {
		return;
	}
}

//-------------------------------------- Fun emotes and chat parser
function emoticons(text) { //emotes are checked and passed into a string before being sent back to chat
	var url = emote_imgage;

	var searchFor = /:D|:-D|Kappa|:\)|:-\)|;\)|';-\)|:\(|:-\(|:o|:\?|8-\)|:x|:P/gi;

	// A map mapping each smiley to its image
	var map = {
		":D" : '/4.gif', // Capped version of the next
		":d" : '/4.gif', // Lower case version of the previous
		":-D" : '/4.gif', // Capped version of the next
		":-d" : '/4.gif', // Lower case version of the previous
		":)" : '/1.gif',
		":-)" : '/1.gif',
		";)" : '/3.gif',
		"';-)" : '/3.gif',
		"Kappa" : '/kappa.png',

		":(" : '/2.gif',
		":-(" : '/2.gif',
		":O" : '/13.gif', // Capped version of the next
		":o" : '/13.gif', // Lower case version of the previous
		":?" : '/7.gif',
		"8-)" : '/16.gif',

		":X" : '/14.gif', // Capped version of the next
		":x" : '/14.gif', // Lower case version of the previous
		":P" : '/10.gif', // Capped version of the next
		":p" : '/10.gif' // Lower case version of the previous
	};

	text = text.replace(searchFor, function (match) {
			var rep;

			rep = map[match];

			return rep ? '<img src="' + url + rep + '" class="emoticons" />' : match;
		});

	return (text);
}

function parse_chat() { //parse chat used for chat commands and to insert emoticons.
	var arr_time = new Array();
	
		setInterval(function () {
			var master = $('#uid').text();
			var name_usr = $('#nick').text();
			var toParse = $("div#chat .chatline:last-child").text();
			var reg_id = /\(([^)]+)\)/;
			var reg_usr = /\<([^)]+)\>/;
			var reg_time = /(?:2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/;
			var id_num = reg_id.exec(toParse);
			var id_usr = reg_usr.exec(toParse);
			var id_time = reg_time.exec(toParse);
			var cleanMsg = toParse.split("> ")[1];
			var log_tag = (id_time[0]);

			if ((log_tag) != (arr_time[0])) {
				arr_time.unshift(log_tag);
				var chat_line = $("div#chat .chatline:last-child").html();
				//console.log(chat_line);
				var chat_line = emoticons(chat_line);
				//console.log(chat_line);
				if ($('#smile_check').prop('checked')) {
					$("div#chat .chatline:last-child").html(chat_line);
				}

//-------------------------------------- Unfinished but will get to it soon
				//console.log(id_time[0] + ' ID: ' + id_num[1] + ' user: ' + id_usr[1] + ' message: ' + cleanMsg);
				if (id_num[1] == master && id_usr[1] == name_usr) {
					if (cleanMsg == "Bstop") {
						//c_stop_bot();
					} else if (cleanMsg == "Commands") {
						sleep(1000);
						//alert("Bstart: this will start the bot" + '\n' + "Bstop: this will stop the bot");
						console.log('Alert commands.');
					} else if (cleanMsg == "Bstart") {
						sleep(1000);
						//c_start_bot();
						//console.log('Bot simulate start!');

					}

				}
			}
		}, 300);

}