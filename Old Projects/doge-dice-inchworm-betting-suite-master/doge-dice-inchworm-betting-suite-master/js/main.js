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
//  fibbonachi Bot 1.0.0
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
var version_c = "1.0.0";
var heartbeat_bpm = 100; //this is the bots ticker if for some reason the site temp bans  for spam betting lower this to 125
var bet_data = [];
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
var high_bet_c = 0;
var high_bet = 0;
var update_min = 0;
var update_lim_max =0;
var booster = 0;
var sys_mult2 = 0;

var max_bet_count = 0;

var start_round = 0;
var round_profit = 0;


//window.location.reload(true);
//-------------------------------------- Heart and possibly soul of the bot. Everything is called from here.
function heart_beat() {
	var sys_mult = parseFloat($("#maxcountInput").val());
	gui();
	footer();

	console.log(' Started ' + gets_date() + ' Heartbeat:' + heartbeat_bpm + '\n' + '\n');

	setInterval(function () {
		value_grip();
		results();
		stats_update();
		total_check();
		Martingale();
		max_loss_streak();
		max_win_streak();
        max_bet();

	}, heartbeat_bpm);
}

//-------------------------------------- increments max loss and max win display
function max_loss_streak() { // longest loss streak
	$("#maxLossInput").css("color", "red");

	if (lose1 > max_loss) {
		max_loss++;
		$("#maxLossInput").val(max_loss);
	}
}

function max_win_streak() { //longest win streak
	$("#maxWinInput").css("color", "green");

	if (win1 > max_win) {
		max_win++;
		$("#maxWinInput").val(max_win);
	}
}

function max_bet() { //longest win streak

	if (high_bet_c > high_bet) {
		high_bet = high_bet_c;
		$("#highestInput").val(high_bet);
	}
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

function update_mini() {
var balance = parseFloat($("#pct_balance").val());

	if (running == 1){
		booster++;
		$("#boost").css("color", "green");
	}
	var sys_mult = parseFloat($("#maxcountInput").val());
	update_min = (balance / (100000 * sys_mult));
	var update_min2 = (update_min * 2);
	update_min2 = scientific(update_min2).toFixed(8);
	update_min = scientific(update_min).toFixed(8); // maxInput
	//update_lim_max = ((balance / 4));
	//update_lim_max = scientific(update_lim_max).toFixed(8);
			
	$("#boost").val(booster);
	//$("#maxInput").val(update_lim_max);
	$("#tprofitInput").val(update_min2);
	$("#minInput").val(update_min);
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
            max_bet_count = 0;
			betting = 0;
			update_graphs();
			play_sound1();

		} else {
            if ((parseFloat($("#maxInput").val()) == (parseFloat($("#pct_bet").val())))){
                max_bet_count++;
                console.log('max bet count: ' + max_bet_count);
                if (max_bet_count >= 1){
                    $("#pct_bet").val($minInput.val());
                        max_bet_count = 0;
                        start_round = balance;
                }
            }
        
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
//-------------------------------------- probability and stat's update
function stats_update() {
	//probability
	var ccbust1 = parseFloat($("#pct_chance").val());
	var ccbust2 = parseFloat($("#limiter").val());
	var cBust3 = 0;
	cBust1 = 1 - ccbust1 / 100;
	cBust2 = Math.pow(cBust1, ccbust2) * 100;

	//betsInput ---total bets
	$("#betsInput").val(run_round);

	//profitInput ---profit  -- start_bal
	balance = parseFloat($("#pct_balance").val());
	current_profit = balance - start_balance;

    if (parseFloat(current_profit) >= 0){
    	$("#profitInput").css("color", "green");
    }
    if (parseFloat(current_profit) < 0){
    	$("#profitInput").css("color", "red");
    }

	$("#profitInput").val(current_profit.toFixed(8));
    
    var round_profit = balance - start_round;
    if (parseFloat(round_profit) >= 0){
    	$("#rprofitInput").css("color", "green");
    }
    if (parseFloat(round_profit) < 0){
    	$("#rprofitInput").css("color", "red");
    }

    $("#rprofitInput").val(round_profit.toFixed(8));
    
    if (round_profit >= ($tprofitInput.val()) ){
        start_round = balance;
        $("#pct_bet").val($minInput.val());
        update_mini();
    }

	var win_ratio = ((won / run_round) * 100);
	if (isNaN(win_ratio)){
		win_ratio = 0;
	}

    if (win_ratio >= ccbust1){
    	$("#percentWonInput").css("color", "green");
    }
    if (win_ratio < ccbust1){
    	$("#percentWonInput").css("color", "red");
    }

	$("#percentWonInput").val(win_ratio.toFixed(8));

	if ($("#reconnect").is(':visible')) { //Thanks 'eltopo' prevents user timeout.
		$("#reconnect").click();
	}
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
            start_round = start_balance;
			console.log('start balance found: ' + start_balance + '\n');
			update_mini();
		}
	}

}

//-------------------------------------- Martingale Function
function Martingale() {
	// pass bet value here bet_click(bet_value)
maxInput = 0;
minInput = 0;
	if (running == 1) {
		if (winning == 1 && betting == 0) {

			var new_bet = parseFloat($("#pct_bet").val() / $divisionInput.val());	

			bet_click(new_bet);

		} else if (winning == 0 && betting == 0) {
		
			var new_bet = parseFloat($("#pct_bet").val()) * $multiplierInput.val();
			
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
	        

	if (steps < marti_limit && betting == 0 && running == 1) {
		if ($('#switch_loss_check').prop('checked')) {
			if (hi_lo) {
				betting = 1;
				bet_value = scientific(bet_value);

				if (bet_value > $maxInput.val()) {
					bet_value = $maxInput.val();
					//console.log('max:' + bet_value);
				}
				if (bet_value < $minInput.val()) {
					bet_value = $minInput.val();
					//console.log('min:' + bet_value);
				}
                high_bet_c = bet_value;
				$("#pct_bet").val(bet_value);
				$("#a_hi").trigger('click');

			} else {
				betting = 1;
				bet_value = scientific(bet_value);

				if (bet_value > $maxInput.val()) {
					bet_value = $maxInput.val();
					//console.log('max:' + bet_value);
				}
				if (bet_value < $minInput.val()) {
					bet_value = $minInput.val();
					//console.log('min:' + bet_value);
				}

                high_bet_c = bet_value;
				$("#pct_bet").val(bet_value);
				$("#a_lo").trigger('click');
			}
		} else {

			betting = 1;
			bet_value = scientific(bet_value);

			if (bet_value > $maxInput.val()) {
				bet_value = $maxInput.val();
				//console.log('max:' + bet_value);
			}
			if (bet_value < $minInput.val()) {
				bet_value = $minInput.val();
				//console.log('min:' + bet_value);
			}

            high_bet_c = bet_value;
			$("#pct_bet").val(bet_value);

			$("#a_hi").trigger('click');
		}
	} else {
		steps = 0;
		running = 0;
		$("#pct_bet").val(reset_bet);
		log_message('***limit reached***');
		console.log('***limit reached***');
		play_sound3();
	}
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
    
    var options = {
        series: {
        	color : '#cdffcc',
            curvedLines: {
            	apply: true,
                active: true
            }
        },
    };
	var plot = $.plot("#g_placeholder", [generate_graph()], options);

	plot.setData([generate_graph()]), options;

	plot.setupGrid();
	plot.draw();
	//console.log('data' + bet_data)
}

//--------------------------------------- Local storage functions
function clearItem(key, value) {
		//console.log("Removing [" + key + ":" + value + "]");
		window.localStorage.removeItem(key);
}

function setItem(key, value) {
	//console.log("Storing [" + key + ":" + value + "]");
	window.localStorage.removeItem(key);
	window.localStorage.setItem(key, value);
	//console.log("Return from setItem" + key + ":" + value);
}

function getItem(key) {
	var value;
	//console.log('Retrieving key [' + key + ']');
	value = window.localStorage.getItem(key);
	//console.log("Returning value: " + value);
	return value;
}

//--------------------------------------- store and load functions
function loads(){
var l1 = getItem('maxcountInput');
var m1 = getItem('multiplier');
var r1 = getItem('division');
var sl = getItem('maxcountInput');

	$('#maxcountInput').val(l1);
	$('#multiplier').val(m1);
	$('#division').val(r1);
	$("#maxcountInput").val(sl);

	console.log('loaded');

}

function saves() {

	var limiters = parseFloat($("#maxcountInput").val());
	var multipliers = parseFloat($("#multiplier").val());
	var reset_steps = parseFloat($("#division").val());
	var maxcountInputs = parseFloat($("#maxcountInput").val());
	setItem('maxcountInput', limiters);
	setItem('multiplier', multipliers);
	setItem('division', reset_steps);
	setItem('maxcountInput', maxcountInputs);

	console.log('saved');

}

//-------------------------------------- builds user interface
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
    
	//smile_check
    $smile_c = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="smile_check" id="smile_check" checked="checked" /> Chat smileys on  </font></div>')
        $o_row1.append($smile_c);

	//switch_loss_check
	$switch_loss_check = $('<div style="margin-right:10px"><font color="white"><input type="checkbox" value="1" name="switch_loss_check" id="switch_loss_check" /> switch hi/lo on loss </font></div>')
		$o_row1.append($switch_loss_check);

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

	$reset = $('<button title="no function yet" style="color:green;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px" id="fleft chatbutton" >reset stats</button>');
	  $reset.click(function () {
		//-----
		reset_stats();
		//----- 
	});
	  $container.append($reset);

    $store = $('<button id="c_run" style="color:green;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px">Store</button>');
    $store.click(function() {
        //-----
        saves();
        //-----
    });  
    $container.append($store); 
    
    $load = $('<button id="c_run" style="color:green;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px">Load</button>');
    $load.click(function() {
        //-----
        loads();
        //-----
    });  
    $container.append($load); 

	$showhidetrigger3 = $('<button title="Toggles bot graph" style="color:green;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px" id="showhidetrigger3" href="#">graph</button>'); //toggle hide for graph
	  $showhidetrigger3.click(function () {
		$('#chipper3').toggle(500);
		//update_graphs();
		$.plot($("#g_placeholder"), [[]]);
	});
	  $container.append($showhidetrigger3);

	$showhidetrigger4 = $('<button title="Toggles bot option gui" style="color:green;margin-bottom:5px;margin-top:5px;margin-right:2px;height:22px" id="showhidetrigger4" href="#">options</button>'); //toggle hide for options
	  $showhidetrigger4.click(function () {
		$('#chipper5').toggle(500);
	});
	  $container.append($showhidetrigger4);
	
	$showhidetrigger5 = $('<button title="Toggles bot option gui" style="margin-right:10px;border:1px solid" id="showhidetrigger4" href="#">Boost</button>'); //toggle hide for options
	  $showhidetrigger5.click(function () {
		$("#pct_bet").val(parseFloat($("#boost").val()));
	});
	  //$container.append($showhidetrigger5);
	
	$showhidetrigger6 = $('<button title="Toggles bot option gui" style="margin-right:10px;border:1px solid" id="showhidetrigger4" href="#">depth</button>'); //toggle hide for options
	  $showhidetrigger6.click(function () {
		$('#depthChipper').toggle(500);
	});
	  //$container.append($showhidetrigger6);

	//-------------------------------------- Inner UI input boxes
	var $row1a = $('<div class="row"/>'); ////////////////////////////////////// row 1a

	  var $limiter = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Steps</p>');
	  $limiterInput = $('<input style="border:1px solid; border-color: #505050;" id="limiter" value="100"/>');
	  var $limiterEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row1a.append($limiter);
	  $row1a.append($limiterInput);
	  $row1a.append($limiterEnd);

	var $row1b = $('<div class="row"/>'); ////////////////////////////////////// row 1b

	  var $multiplier = $('<p style="border:1px solid; border-color: #505050;" class="llabel">muliply</p>');
	  $multiplierInput = $('<input style="border:1px solid; border-color: #505050;" id="multiplier" value="2.2"/>');
	var $multiplierEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">*</p>');
	  $row1b.append($multiplier);
	  $row1b.append($multiplierInput);
	$row1b.append($multiplierEnd);

	var $row1c = $('<div class="row"/>'); ////////////////////////////////////// row 1c

	  var $division = $('<p style="border:1px solid; border-color: #505050;" class="llabel">divide</p>');
	  $divisionInput = $('<input style="border:1px solid; border-color: #505050;" id="division" value="1.09"/>');
	var $divisionEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">\\</p>');
	  $row1c.append($division);
	  $row1c.append($divisionInput);
	$row1c.append($divisionEnd);
	
	var $row1d = $('<div class="row"/>'); ////////////////////////////////////// row 1d

	  var $max = $('<p style="border:1px solid; border-color: #505050;" class="llabel">limit max</p>');
	  $maxInput = $('<input style="border:1px solid; border-color: #505050;" id="maxInput" value="700"/>');
	var $maxEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">+</p>');
	  $row1d.append($max);
	  $row1d.append($maxInput);
	$row1d.append($maxEnd);
    
	var $row1e = $('<div class="row"/>'); ////////////////////////////////////// row 1e

	  var $maxcount = $('<p style="border:1px solid; border-color: #505050;" class="llabel">sys mult</p>');
	  $maxcountInput = $('<input style="border:1px solid; border-color: #505050;" id="maxcountInput" value="1"/>');
	var $maxcountEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row1e.append($maxcount);
	  $row1e.append($maxcountInput);
	$row1e.append($maxcountEnd);

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

	  var $min = $('<p style="border:1px solid; border-color: #505050;" class="llabel">limit min</p>');
	  $minInput = $('<input style="border:1px solid; border-color: #505050;" id="minInput" class="readonly" value="0.1"/>');
	var $minEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">-</p>');
	  $row2d.append($min);
	  $row2d.append($minInput);
	$row2d.append($minEnd);
    
	var $row2e = $('<div class="row"/>'); ////////////////////////////////////// row 2e

	  var $boost = $('<p style="border:1px solid; border-color: #505050;" class="llabel">round w</p>');
	  $boostInput = $('<input style="border:1px solid; border-color: #505050;" id="boost" class="readonly" value="2"/>');
	var $boostEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row2e.append($boost);
	  $row2e.append($boostInput);
	$row2e.append($boostEnd);

	var $row3a = $('<div class="row"/>'); ///////////////////////////////// row 3a

	  var $bets = $('<p style="border:1px solid; border-color: #505050;" class="llabel">total bets</p>');
	  $betsInput = $('<input style="border:1px solid; border-color: #505050;" id="betsInput" class="readonly" value="0"/>');
	  var $betsEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row3a.append($bets);
	  $row3a.append($betsInput);
	  $row3a.append($betsEnd);


	var $row3b = $('<div class="row"/>'); ////////////////////////////////////////////// row 3b

	  var $profit = $('<p style="border:1px solid; border-color: #505050;" class="llabel">profit</p>');
	  $profitInput = $('<input style="border:1px solid; border-color: #505050;" id="profitInput" class="readonly" value="0"/>');
	var $profitEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">Ð</p>');
	  $row3b.append($profit);
	  $row3b.append($profitInput);
	$row3b.append($profitEnd);
    
	var $row3c = $('<div class="row"/>'); ////////////////////////////////////////////// row 3c

	  var $tprofit = $('<p style="border:1px solid; border-color: #505050;" class="llabel">target</p>');
	  $tprofitInput = $('<input style="border:1px solid; border-color: #505050;" id="tprofitInput" class="readonly" value="0.1"/>');
	var $tprofitEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">Ð</p>');
	  $row3c.append($tprofit);
	  $row3c.append($tprofitInput);
	$row3c.append($tprofitEnd);
    
	var $row3d = $('<div class="row"/>'); ////////////////////////////////////////////// row 3d

	  var $rprofit = $('<p style="border:1px solid; border-color: #505050;" class="llabel">round p</p>');
	  $rprofitInput = $('<input style="border:1px solid; border-color: #505050;" id="rprofitInput" class="readonly" value="0"/>');
	var $rprofitEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">Ð</p>');
	  $row3d.append($rprofit);
	  $row3d.append($rprofitInput);
	$row3d.append($rprofitEnd);

	var $row3e = $('<div class="row"/>'); ////////////////////////////////////////////// row 3e

	  var $highest = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Highest</p>');
	  $highestInput = $('<input style="border:1px solid; border-color: #505050;" id="highestInput" class="readonly" value="0"/>');
	var $highestEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">Ð</p>');
	  $row3e.append($highest);
	  $row3e.append($highestInput);
	$row3e.append($highestEnd);
    
	//-------------------------------------- Graph Div
	var $graphDiv = $('<fieldset id="chipper3" style="margin-left:70px;background-color:rgba(35,35,35,0.9);border:2px solid; border-color: #999999;width:700px;height:100px;margin-right:3px" class="graph-container"><div style="padding: 0;width:700px;height:100px;margin-right:0px" id="g_placeholder" class="graph-placeholder"></div>'); //graph holder
	
	var $depth = $('<div id="depthChipper" align="center"><table id="depth" border="1" bordercolor="#999999" style="" width="400" cellpadding="3" cellspacing="3"><tr><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td><td><FONT COLOR="white">0</FONT></td></tr></table></div>');


	//-------------------------------------- Putting it all together
	var $fieldset_o = $('<fieldset style="background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	  

	var $fieldset = $('<fieldset style="margin-left:auto;margin-right:2px;background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	$fieldset.append($row1a);
	$fieldset.append($row1b);
	$fieldset.append($row1c);
	$fieldset.append($row1d);
	$fieldset.append($row1e);
	
	var $fieldset2 = $('<fieldset style="margin-left:auto;margin-right:2px;background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	$fieldset2.append($row2a);
	$fieldset2.append($row2b);
	$fieldset2.append($row2c);
	$fieldset2.append($row2d);
    $fieldset2.append($row2e);

	var $fieldset3 = $('<fieldset style="margin-left:auto;margin-right:2px;background-color:rgba(35,35,35,0.5);border:2px solid; border-color: #999999;"/>');
	$fieldset3.append($row3a);
	$fieldset3.append($row3b);
	$fieldset3.append($row3c);
	$fieldset3.append($row3d);
	$fieldset3.append($row3e);

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
	$button_group.append($depth);
	$button_group.append("<div align='center' style='color:white;font-size:10pt;'>Inchworm Bot</div>");
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
		$('#depthChipper').hide();
	});

	//-------------------------------------- Add toggle for UI
	$(document).ready(function () { // toggle hide function for gui
		$('#chipper').hide();
		$('a#showhidetrigger').click(function () {
			$('#chipper').toggle(500);
		});
	});

}

//-------------------------------------- updates table elements
function changeContent(colum, data) {
	var x = document.getElementById('depth').rows[0].cells;
	x[colum].innerHTML = data;
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

	console.log('Welcome to the Inchworm Suite V1');
	log_message('Welcome to the Inchworm Suite V1');
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

			//$("#required_bank").val(total.toFixed(8));

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
