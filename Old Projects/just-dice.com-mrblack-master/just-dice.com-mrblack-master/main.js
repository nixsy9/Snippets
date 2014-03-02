//-------------------------------------------------------------------
//            Added a licence To ensure freedoms.
//-------------------------------------------------------------------
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
//If you win loads or just like this bot consider donating a coffee and a pizza =) 1NixsyLiMFX3wwLqdtAVsNLsWwqDpbmuhP
//-------------------------------------------------------------------
var timer;
var bal;
var bet;
var current_steps = 1;
var start_bet = 0;
var $multiplier;
var $steps;
var $run;
var running = false;
var arr_ignore = new Array();
var count_steps = 1;
var test_bet = 0;
var reset_bet = 0.00000001; //keep the same as value in array after 0
var bet_delay = 1400;
var bet_count = 0;
var wins = 0;
var losses = 0;
var winpercentage1 = 0;
var lastBal = 0;
var check_step = 0;
var profit;
var max_loss = 0;
var lose1 = 0;
var bet_limiter = 35; //IMPORTANT current max count_steps value, This should reflect the max value's in array below.
var ccbust1;
var ccbust2;
var seq_mul = 1;
var snd = new Audio('http://www.soundjay.com/button/sounds/beep-7.mp3');
winning = false;

strategy = new Array(0, 0.0000001, 0.0000002, 0.0000003, 0.0000004, 0.0000005, 0.0000007, 0.000001, 0.0000015, 0.000002, 0.000003, 0.000004, 0.000005, 0.000007, 0.00001, 0.000015, 0.00002, 0.00003, 0.00004, 0.00005, 0.00007, 0.0001, 0.00015, 0.0002, 0.0003, 0.0004, 0.0005, 0.0007, 0.001, 0.0015, 0.002, 0.004, 0.005, 0.007, 0.001); //ADD YOUR STRATEGY IN HERE

function probability_loop() {

	setInterval(function () {
		var ccbust1 = parseFloat($("#pct_chance").val());
		cBust1 = 1 - ccbust1 / 100;
		cBust2 = Math.pow(cBust1, bet_limiter) * 100;

		$("#probability_1").val(cBust2.toFixed(10));
	}, 800);
}

function bet_delay_loop() {

	setInterval(function () {

		if ((strategy[(current_steps)]).val > 0.00100000) {
			bet_delay = 200;
		} else if ((strategy[(current_steps)]).val > 0.00010000 && (strategy[(current_steps)]).val < 0.00100000) {
			bet_delay = 500;
		} else if ((strategy[(current_steps)]).val > 0.00001000 && (strategy[(current_steps)]).val < 0.00010000) {
			bet_delay = 700;
		} else if ((strategy[(current_steps)]).val > 0.00000100 && (strategy[(current_steps)]).val < 0.00001000) {
			bet_delay = 900;
		} else if ((strategy[(current_steps)]).val > 0.00000010 && (strategy[(current_steps)]).val < 0.00000100) {
			bet_delay = 1100;
		} else {
			bet_delay = 1400;
		}
	}, 800);
}

function total_loop() {
	setInterval(function () {
		var sum = strategy.reduce(function (previousValue, currentValue) {
				return currentValue + previousValue;
			});
		var profit = parseFloat($("#pct_balance").val()) - lastBal;
		$("#total2").val(sum);
		$("#bet_c").val(bet_count);
		$("#win_lose").val((winpercentage1).toFixed(2));
		$("#loss_l").val(max_loss);

		$("#profit_b").val((profit).toFixed(8));
		//$("#pct_chance").val(25); // removed to players can change values when adding new strategys
		//$("#pct_payout").val(3.96);

	}, 800);
}

function max_loss_streak() {
	setInterval(function () {
		if (lose1 > max_loss) {
			max_loss++;
		} else {
			// nothing here move along XD
		}
	}, 800);
}

function martingale() {

	if (bal.data('oldVal') != bal.val() && running) {
		clearInterval(timer);

		var curr_bal = bal.val();

		if (check_step == 0) {
			lastBal = parseFloat($("#pct_balance").val());
			check_step = 1;

		}

		if (curr_bal > bal.data('oldVal')) { //win so reset
			current_steps = 1;
			count_steps = 1;

			var new_val = (strategy[(current_steps)]);

			winpercentage1 = ((wins / bet_count) * 100);

			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));
				console.log('new_val=' + new_val);

			}

			$("#pct_bet").val(new_val);
			current_steps++;
			count_steps++;
			bet_count++;
			wins++;
			lose1 = 0;
			winning = true;
			$("#a_hi").trigger('click');

		} else if (curr_bal < bal.data('oldVal') && (count_steps < (bet_limiter + 1))) {
			//set_betting();
			//bet according count_step value

			var new_val = (strategy[(current_steps)]);
			winpercentage1 = ((wins / bet_count) * 100);

			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));
				console.log('new_val=' + new_val);

			}

			$("#pct_bet").val(new_val);

			//Increase the steps
			current_steps++;
			count_steps++;
			bet_count++;
			losses++;
			lose1++;
			winning = false;
			$("#a_hi").trigger('click');
		}

		//otherwise we go back to the start
		else {
			current_steps = 1;
			count_steps = 1;
			var new_val = (strategy[(current_steps)]);
			$("#pct_bet").val(new_val);
			running = false;
		}

		// Updated stored value
		bal.data('oldVal', bal.val());
		timer = setInterval(function () {
				martingale()
			}, bet_delay);

	} else
		bal.data('oldVal', bal.val());

}

function create_ui() {

	// Extra buttons found on pastebin http://pastebin.com/n8X8uRAT Originally from a user called "v" and edited by another unknown user.

	$('.button_inner_group:nth(2)').append(
		'<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", $("#invest_code").val());\'>invest all<div class="key">J</div></button>').append(
		'<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("divest", csrf, "all", $("#divest_code").val());\'>divest all<div class="key">K</div></button>');

	var $container = $('<div id="chipper" class="container"/>');
	var $button_group = $('<div style="background-color:#878787;border:2px solid; border-color: #6E6E6E;" class="button_group"/>');
	$container.append($button_group);

	var $martingale_button = $('<button style="margin-top:30px;margin-right:3px;height:65px;;width:70px;color:transparent;background-color:transparent;border:none;"><img src="https://dl.dropboxusercontent.com/u/27471347/xZALcXD.png"> class="button_label chance_toggle">mrblack</button>');

	var $run_div = $('<div class="button_inner_group"/>');
	$run = $('<button style="margin-top:30px;border:1px solid; border-color: #6E6E6E" id="c_run">Run</button>');

	$run.click(function () {
		running = true;
		start_bet = (strategy[(current_steps)]);
		$("#a_hi").trigger('click');
	});
	$run_div.append($run);

	$stop = $('<button style="margin-top:30px;border:1px solid; border-color: #6E6E6E" id="c_stop">stop</button>');

	$stop.click(function () {
		running = false;
		count_steps = 1;
		current_steps = 1;
	});
	$run_div.append($stop);

	/*
	$test_b = $('<button style="margin-top:30px;border:1px solid; border-color: #6E6E6E" id="test">test</button>');

	$test_b.click(function () {
	play_sound()
	});
	$run_div.append($test_b);
	 */

	var $row1 = $('<div class="row"/>');
	var $label1 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="llabel">bank needed</p>');
	$multiplier = $('<input style="border:1px solid; border-color: #6E6E6E;" id="total2" class="readonly" />');
	var $x = $('<p style="border:1px solid; border-color: #6E6E6E;" class="rlabel">+</p>');
	$row1.append($label1);
	$row1.append($multiplier);
	$row1.append($x);

	var $row2 = $('<div class="row"/>');
	var $label2 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="llabel">bet Count</p>');
	$steps = $('<input style="border:1px solid; border-color: #6E6E6E;" id="bet_c" class="readonly" />');
	var $c1 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="rlabel">#</p>');
	$row2.append($label2);
	$row2.append($steps);
	$row2.append($c1);

	var $row1b = $('<div class="row"/>');
	var $label3 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="llabel">win %</p>');
	$multiplier2 = $('<input style="border:1px solid; border-color: #6E6E6E;" id="win_lose" class="readonly" />');
	var $xx = $('<p style="border:1px solid; border-color: #6E6E6E;" class="rlabel">%</p>');
	$row1b.append($label3);
	$row1b.append($multiplier2);
	$row1b.append($xx);

	var $row2b = $('<div class="row"/>');
	var $label4 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="llabel">profit</p>');
	$stepsa = $('<input style="border:1px solid; border-color: #6E6E6E;" id="profit_b" class="readonly" />');
	var $c2 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="rlabel">฿</p>');
	$row2b.append($label4);
	$row2b.append($stepsa);
	$row2b.append($c2);

	var $row1c = $('<div class="row"/>');
	var $label5 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="llabel">Max loss</p>');
	$stepsb = $('<input style="border:1px solid; border-color: #6E6E6E;" id="loss_l" class="readonly" />');
	var $c3 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="rlabel">#</p>');
	$row1c.append($label5);
	$row1c.append($stepsb);
	$row1c.append($c3);

	var $row2c = $('<div class="row"/>');
	var $label6 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="llabel">Probability</p>');
	$stepsc = $('<input style="border:1px solid; border-color: #6E6E6E;" id="probability_1" class="readonly" />');
	var $c4 = $('<p style="border:1px solid; border-color: #6E6E6E;" class="rlabel">%</p>');
	$row2c.append($label6);
	$row2c.append($stepsc);
	$row2c.append($c4);

	var $fieldset = $('<fieldset/>');
	$fieldset.append($row1);
	$fieldset.append($row2);

	var $fieldset2 = $('<fieldset/>');
	$fieldset2.append($row1b);
	$fieldset2.append($row2b);

	var $fieldset3 = $('<fieldset/>');
	$fieldset3.append($row1c);
	$fieldset3.append($row2c);

	$button_group.append($martingale_button);
	$button_group.append($fieldset);
	$button_group.append($fieldset2);
	$button_group.append($fieldset3);
	$button_group.append($run_div);
	$button_group.append("<div align='center' style='color:white;font-size:8pt;'>---- Bet sequence. v.1.0 ---- (C) 2013  CriticalNix ---- If you like this consider donating a coffee and pizza ฿:1DKrERTfV7ni1hrhmvCCTbG9xXgERtXsK ----</div>");

	$(".container").eq('1').append('<a id="showhidetrigger" href="#"><font color="#66FF66">show/hide</font></a>');
	$(".container").eq('1').append($container);
	$(".container").eq('1').append('<div style="clear:left;"/>');

	$(document).ready(function () {
		$('#chipper').hide();
		$('a#showhidetrigger').click(function () {
			$('#chipper').toggle(700);
		});
	});

}

function set_run() {
	if ($multiplier !== undefined &&
		$steps !== undefined)
		if ($.isNumeric($multiplier.val()) &&
			$.isNumeric($steps.val()) &&
			$.isNumeric($('#pct_bet').val())) {

			var total = 0;
			var mult = 1;
			var i;
			console.log('steps: ' + $steps.val() +
				'   multiplier:' + $multiplier.val() +
				'   bal: ' + $('#pct_balance').val() +
				'   bet:' + $('#pct_bet').val());

			for (i = 0; i < $steps.val(); i++) {
				total += $('#pct_bet').val() * mult;
				mult *= $multiplier.val();
			}
			console.log('total:' + total);

			if (1 == 1) {
				console.log("setting class VALID");
				$run.removeClass('invalid');
			} else {
				console.log("setting class VALID");
				$run.removeClass('invalid');
			}
		} else {
			console.log("setting class VALID");
			$run.removeClass('invalid');

		}
}

$(document).ready(function () {

	console.log('starting');

	create_ui();

	max_loss_streak()

	total_loop();

	probability_loop();

	bet_delay_loop();

	//set the balance
	//when the balance changes and we're martingaling
	//we'll do our stuff
	bal = $("#pct_balance");
	bal.data('oldVal', bal.val());
	timer = setInterval(function () {
			martingale()
		}, bet_delay);

	//we also monitor the bet b/c it can also determine if
	//we have enough btc to bet the martingale run
	bet = $("#pct_bet");
	bet.data('oldVal', bet.val());
	setInterval(function () {
		if (bet.data('oldVal') != bet.val() && !running) {
			bet.data('oldVal', bet.val());
			set_run();
		}
	}, 100);

	$(document).keydown(function (e) {
		var ctrlDown = false;
		var ctrlKey = 17,
		qKey = 81,
		rKey = 82;

		if (!$(document.activeElement).is('input') &&
			(e.keyCode == rKey)) {
			running = true;
			start_bet = $("#pct_bet").val();
			$("#a_hi").trigger('click');
		}

		$(document).keydown(function (e) {
			if (e.keyCode == ctrlKey)
				ctrlDown = true;
		}).keyup(function (e) {
			if (e.keyCode == ctrlKey)
				ctrlDown = false;
		});

		if (ctrlDown && (e.keyCode == qKey)) {
			clearInterval(timer);
			running = false;
			current_steps = 1;
		}
	});

});

(function ($) {

	$.extend({
		playSound : function () {
			return $("<embed src='" + arguments[0] + "' hidden='true' autostart='true' loop='false' class='playSound'>").appendTo('body');
		}
	});

})(jQuery);