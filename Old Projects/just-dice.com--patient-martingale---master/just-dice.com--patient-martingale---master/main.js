var timer;
var bal;
var bet;
var current_steps = 1;
var start_bet = 0;
var $multiplier;
var $steps;
var $run;
var running = false;
var cBust3 = 1; // probability
var multi4 = 1; //suggested multiplier value
var martinDelay = 1400; //fast or slow
var new_val = 0.00000001;
var new_val2 = 0; //check for martinDelay_loop
var total = 0;
var mult = 1;
var win1 = 0;
var lose1 = 0;
var max_win = 0;
var max_loss = 0;
var max_loss_length = 0;
var bet_total = 0;
var yin_yang = 0;
var yin_yang2 = 0;
var check_step = 0;
var profit = 0;
var winning = 0; //winning or not
var test_bet = 0.00000016; // small bet looking for loss streak
var start_martingale = 0.000009; // actual martingale bet
var bit_bank = 0;
var bit_bank2 = 1;
var m_delay = 0;
var m_delay2 = 0;

var icon_imgage = chrome.extension.getURL('img/icon.png');

var version_c = "1.0.3";

function appendVersion() {
	test_css(' Patient martingale System' + version_c + ' loaded');
}

function test_css(message) { // shows a message in log area
	document.querySelector(".log").innerHTML = (message);
	setInterval(function () {
		document.querySelector(".log").innerHTML = " ";
	}, 6000);
}

function asscess() {
	/////////////////////////// test bet value //////////////////

	test_bet = parseFloat($("#test_b").val());

	console.log('assess test bet: ' + test_bet);

	////////////////////////// Start bet value /////////////////

	start_martingale_2 = parseFloat($("#test_m").val());
	start_martingale = start_martingale_2;
		if (String(start_martingale).indexOf('e') !== -1) {
			var arr = new Array();
			arr = String(start_martingale).split('e');
			start_martingale = start_martingale.toFixed(arr[1].substring(1));
		}	

	console.log('assess start martingale: ' + start_martingale);

	////////////////////////////////////////////////////////////////
}

function martinDelay_loop() { //auto tweaks the delay speed according to values found on the just-dice FAQ

	setInterval(function () {

		if (new_val != new_val2) {
			new_val2 = new_val;
			if (new_val > 0.00100000) {
				martinDelay = 300;
				console.log('running speed changed to ' + (martinDelay / 1000) + ' seconds');
			} else if (new_val > 0.00010000 && new_val < 0.00100000) {
				martinDelay = 600;
				console.log('running speed changed to ' + (martinDelay / 1000) + ' seconds');
			} else if (new_val > 0.00001000 && new_val < 0.00010000) {
				martinDelay = 800;
				console.log('running speed changed to ' + (martinDelay / 1000) + ' seconds');
			} else if (new_val > 0.00000100 && new_val < 0.00001000) {
				martinDelay = 1000;
				console.log('running speed changed to' + (martinDelay / 1000) + ' seconds');
			} else if (new_val > 0.00000010 && new_val < 0.00000100) {
				martinDelay = 1200;
				console.log('running speed changed to ' + (martinDelay / 1000) + ' seconds');
			} else if (new_val < 0.000010) {
				martinDelay = 1600;
				console.log('running speed changed to ' + (martinDelay / 1000) + ' seconds');
			} else {
				martinDelay = 3300;
				console.log('running speed changed to ' + (martinDelay / 1000) + ' seconds');
			}

		}

	}, 100);
}

function max_loss_streak() { // function to update longest loss streak
	//$("#max_loss").css("color", "red");
	setInterval(function () {
		if (lose1 > max_loss) {
			max_loss++;
			$("#max_loss").val(max_loss);
		} else {
			// nothing here move along XD
		}
	}, 800);
}

function max_win_streak() { //function to update longest win streak
	//$("#max_win").css("color", "green");
	setInterval(function () {
		if (win1 > max_win) {
			max_win++;
			$("#max_win").val(max_win);
		} else {
			// nothing here move along XD
		}
	}, 800);
}

function probability() {
	setInterval(function () {

		//probability
		ccdelay = parseFloat($("#delay_amt").val());
		cbust3 = 0;
		ccbust1 = parseFloat($("#pct_chance").val());
		ccbust2 = parseFloat($("#steps").val());
		ccbust2 = ccbust2 + ccdelay;
		cBust1 = 1 - ccbust1 / 100;
		cBust2 = Math.pow(cBust1, ccbust2) * 100;

		//suggested multiplier
		multi3 = 0;
		multi3 = (99 / (99 - (ccbust1)) + 0.1);
		var current_balance = parseFloat($("#pct_balance").val());

		if (multi3 != multi4) {
			multi4 = multi3;
			$("#Guess_amt").val((multi3).toFixed(2));
		}

		if (cBust3 != cBust2) {
			cBust3 = cBust2;
			asscess();

			$("#magic_amt").val(cBust2.toFixed(10));

			console.log('   Probability:' + cBust3 +
				'   Total length:' + ccbust2);
		}

	}, 800);
}

function update_counter() {
	if (check_step == 0)
		     {
			lastBal = parseFloat($("#pct_balance").val());
			check_step = 1;
			        
		}
	profit = parseFloat($("#pct_balance").val()) - lastBal;
	profit = +profit || 0;
	$("#pro_fits").val((profit).toFixed(8)); //Update Profit
}

function r_martingale() {

	if (bal.data('oldVal') != bal.val() && running) {

		clearInterval(timer);

		// add a single step to grab starting balance and stop value
		if (check_step == 0)
			     {
				lastBal = parseFloat($("#pct_balance").val());
				check_step = 1;
				        
			}
		var curr_bal = bal.val();

		if (curr_bal < bal.data('oldVal') && (m_delay2 == ($delay_amt.val()))) { // End Test bet step

			console.log('delay: ' + m_delay2 + ' steps: ' + current_steps);
			asscess();
			//current_steps = 1;
			$("#pct_bet").val(start_martingale);

			var new_val = $("#pct_bet").val() * $multiplier.val();

			///////////////////////get rid of scientific notation
			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));

				console.log('new_val=' + new_val);
			}
			//////////////////////////////////// Update and click
			m_delay2++;
			yin_yang2 = ((yin_yang / bet_total) * 100);
			lose1++;
			bet_total++;
			win1 = 0;
			update_counter();
			$("#a_hi").trigger('click');
			//////////////////////////////////// end of update and click

		} else if (curr_bal < bal.data('oldVal') && $.isNumeric($multiplier.val()) && $.isNumeric($steps.val()) && (m_delay2 < $delay_amt.val()) && running) { //Delay step


			/////////////////////Increase our bet by the multiplier
			var new_val = test_bet;

			console.log(' delay test bet set to ' + test_bet);

			////////////////////////get rid of scientific notation
			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));
				console.log('new_val=' + new_val);
			}

			//////////////////////////////////// Update and click
			m_delay2++;
			yin_yang2 = ((yin_yang / bet_total) * 100);
			lose1++;
			win1 = 0;
			bet_total++;
			$("#pct_bet").val(new_val);
			update_counter();
			$("#a_hi").trigger('click');
			//////////////////////////////////// end of update and click
		} else if (curr_bal > bal.data('oldVal')) { //win step

			console.log('delay: ' + m_delay2 + ' steps: ' + current_steps);
			current_steps = 1;
			$("#pct_bet").val(start_bet);

			/////////////////////Increase our bet by the multiplier
			var new_val = test_bet;

			console.log(' win step test bet set to ' + test_bet);

			////////////////////////get rid of scientific notation
			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));
				console.log('new_val=' + new_val);
			}

			//////////////////////////////////// Update and click
			m_delay2 = 0;
			yin_yang2 = ((yin_yang / bet_total) * 100);
			lose1 = 0;
			win1++;
			current_steps = 1;
			yin_yang++;
			bet_total++;
			$("#pct_bet").val(new_val);
			update_counter();
			$("#a_hi").trigger('click');
			asscess();
			//////////////////////////////////// end of update and click


		} else if (((current_steps - 1) < $steps.val()) && curr_bal < bal.data('oldVal') && (m_delay2 > ($delay_amt.val()))) { // Loss step

			console.log('delay: ' + m_delay2 + ' steps: ' + current_steps);
			asscess();
			//current_steps = 1;
			//$("#pct_bet").val(start_bet);

			var new_val = $("#pct_bet").val() * $multiplier.val();

			///////////////////////get rid of scientific notation
			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));

				console.log('new_val=' + new_val);
			}
			//////////////////////////////////// Update and click
			current_steps++;
			yin_yang2 = ((yin_yang / bet_total) * 100);
			lose1++;
			bet_total++;
			win1 = 0;
			update_counter();
			$("#pct_bet").val(new_val);
			$("#a_hi").trigger('click');
			//////////////////////////////////// end of update and click

		} else { //////////////////////////////// Bust step
			m_delay2 = 0;
			current_steps = 1;
			yin_yang2 = ((yin_yang / bet_total) * 100);
			$("#pct_bet").val(start_bet);
			running = false;
			$("#win_lose").val(yin_yang2);
		}

		//////////////////////////////////// Updated stored value
		bal.data('oldVal', bal.val());
		timer = setInterval(function () {
				r_martingale()
			}, martinDelay);

	} else
		bal.data('oldVal', bal.val());

}

function tabber() {
	        var markup = '<div class="bot-stats"><p>more here soon</p><div class="bot-foot">';
	                $panelWrapper = $('<div>').attr('id', 'Nixsy9').css({
			display : 'none'
		}).insertAfter('#faq'),
	                $panel = $('<div>').addClass('panel').append(markup).appendTo($panelWrapper),
	                                
	                                $s_bet = $('#gbs_bet')
		       

		        $('<li>').append($('<a>').text('Bot-Help').attr('href', '#Nixsy9')).appendTo('.tabs');
};

function create_ui() {

	var $container = $('<div class="container"/>');
	var $button_group = $('<div style="background-color:#787878 ;border:2px solid; border-color: #505050;" class="button_group"/>');
	var $button_group2 = $('<div style="background-color:#787878 ;border:2px solid; border-color: #505050;" class="button_group"/>');
	var $button_group3 = $('<div style="background-color:#787878 ;border:2px solid; border-color: #505050;" class="button_group"/>');
	$container.append($button_group);

	var $r_martingale_button = $('<button class="button_label chance_toggle" style="margin-top:13px;margin-right:3px;height:65px;;width:70px;color:transparent;background-color:transparent;border:none;"><img src="' + icon_imgage + '"></button>');

	var $run_div = $('<div class="button_inner_group"/>');

	$run = $('<button id="c_run" style="margin-bottom:5px;margin-right:5px;margin-top:5px;margin-left:5px;">Go</button>');
	$run.click(function () {
		asscess();
		running = true;
		start_bet = test_bet;
		if (String(start_bet).indexOf('e') !== -1) {
			var arr = new Array();
			arr = String(start_bet).split('e');
			start_bet = start_bet.toFixed(arr[1].substring(1));
		}
		$("#pct_bet").val(start_bet);
		$("#a_hi").trigger('click');
	});
	$run_div.append($run);

	$Stop = $('<button id="c_stop" style="margin-bottom:5px;margin-top:5px;margin-right:5px;margin-left:5px;">Stop</button>');
	$Stop.click(function () {
		asscess();
		set_run();
		running = false;
		start_bet = test_bet;
		if (String(start_bet).indexOf('e') !== -1) {
			var arr = new Array();
			arr = String(start_bet).split('e');
			start_bet = start_bet.toFixed(arr[1].substring(1));
		}
		$("#pct_bet").val(start_bet);
		  
	});
	$run_div.append($Stop);

	var $row1 = $('<div class="row"/>');
	var $label1 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Multiplier</p>');
	$multiplier = $('<input style="border:1px solid; border-color: #505050;" id="multiplier" value="2.1"/>');
	var $x = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">x</p>');
	$row1.append($label1);
	$row1.append($multiplier);
	$row1.append($x);

	var $label2 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Steps</p>');
	$steps = $('<input style="border:1px solid; border-color: #505050;" id="steps" value="4"/>');
	var $numz = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	$row1.append($label2);
	$row1.append($steps);
	$row1.append($numz);

	var $delay_g = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Delay</p>');
	   $delay_amt = $('<input style="border:1px solid; border-color: #505050;" id="delay_amt" value="13" />');
	var $delay_e = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	   $row1.append($delay_g);
	   $row1.append($delay_amt);
	$row1.append($delay_e);

	var $row2 = $('<div class="row"/>');
	var $label10 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Max wins</p>');
	   $max_win = $('<input style="border:1px solid; border-color: #505050;" id="max_win" value="0" class="readonly" />');
	var $numz9 = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	   $row2.append($label10);
	   $row2.append($max_win);
	$row2.append($numz9);

	var $label11 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Max losses</p>');
	  $max_loss = $('<input style="border:1px solid; border-color: #505050;" id="max_loss" value="0" class="readonly" />');
	var $numz10 = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	   $row2.append($label11);
	   $row2.append($max_loss);
	$row2.append($numz10);

	var $label7 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Bets</p>');
	$Bet_amt = $('<input style="border:1px solid; border-color: #505050;" id="Bet_amt" value="0" class="readonly" />');
	var $bet_end = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	   $row2.append($label7);
	   $row2.append($Bet_amt);
	$row2.append($bet_end);

	var $row3 = $('<div class="row"/>');
	var $label5 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Profit</p>');
	   $test_bet = $('<input style="border:1px solid; border-color: #505050;" id="pro_fits" value="0" class="readonly"/>');
	var $numz4 = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	   $row3.append($label5);
	   $row3.append($test_bet);
	$row3.append($numz4);

	var $label9 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Probability</p>');
	   $magic_amt = $('<input style="border:1px solid; border-color: #505050;" id="magic_amt" value="0" class="readonly" />');
	var $numz8 = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	   $row3.append($label9);
	   $row3.append($magic_amt);
	$row3.append($numz8);

	var $label6 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Win %</p>');
	  $test_betS = $('<input style="border:1px solid; border-color: #505050;" id="win_lose" value="0" class="readonly"/>');
	var $numz5 = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	   $row3.append($label6);
	   $row3.append($test_betS);
	$row3.append($numz5);

	var $row4 = $('<div class="row"/>');
	var $bb1 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Test B</p>');
	   $bb1a = $('<input style="border:1px solid; border-color: #505050;" id="test_b" value="0"/>');
	var $bb1e = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	   $row4.append($bb1);
	   $row4.append($bb1a);
	$row4.append($bb1e);

	var $bm1 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Start bet</p>');
	  $bm1a = $('<input style="border:1px solid; border-color: #505050;" id="test_m" value="0"/>');
	var $bm1e = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	   $row4.append($bm1);
	   $row4.append($bm1a);
	$row4.append($bm1e);

	var $label8 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Suggested x</p>');
	  $guess_amt = $('<input style="border:1px solid; border-color: #505050;" id="Guess_amt" value="0" class="readonly" />');
	var $numz7 = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">x</p>');
	   $row4.append($label8);
	   $row4.append($guess_amt);
	$row4.append($numz7);

	var $fieldset = $('<fieldset style="background-color:transparent;border:2px solid; border-color: #505050;"/>');
	var $fieldset2 = $('<fieldset style="background-color:transparent;border:2px solid; border-color: #505050;"/>');

	$simBox1 = $('<div />');
	$simBox2 = $('<div />');

	$simBox1.append($row1);
	$simBox2.append($row2);
	$simBox2.append($row3);
	$simBox2.append($row4);

	$fieldset.append($simBox1);
	$fieldset.append($simBox2);

	$button_group.append($r_martingale_button);
	$button_group.append($fieldset);
	$button_group.append($run_div);
	$button_group.append("<div align='center' style='color:white;font-size:8pt;'>Patient Martingale System</div>");

	$(".container").eq('1').append($container);
	$(".container").eq('1').append('<div style="clear:left;"/>');
	
    $('.button_inner_group:nth(2)').append('<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", $("#invest_code").val());\'>invest all<div class="key">N</div></button>').append('<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("divest", csrf, "all", $("#divest_code").val());\'>divest all<div class="key">M</div></button>');

}

function set_run() { //logic and check if bot has enough bank for martingale
	  if($multiplier !== undefined &&
		      $steps !== undefined)
	      if($.isNumeric($multiplier.val()) &&
		           $.isNumeric($steps.val())) {

		           var total = 0;
		           var mult = 1;
		           var i;

		           for(i = 0; i < $steps.val(); i++) {
			             total += start_martingale * mult; //total = total + $('#pct_bet').val() * mult;
			             mult *= $multiplier.val(); //mult = mult * $multiplier.val();
			           
		}
		           console.log('total bank needed for martingale:' + total);

		           if(total != 0 && total < $('#pct_balance').val()) {
			             console.log("setting class VALID");
			         $run.removeClass('invalid');
			           
		}
		           else {
			                console.log("setting class VALID");
			         $run.removeClass('invalid');
			           
		}
		      
	}

	      else {
		            console.log("setting class VALID");
			         $run.removeClass('invalid');

		      
	}
}

//
//The main stuff
//
$(document).ready(function () {

	console.log(' Reverse martingale system' + version_c + ' loaded');

	create_ui();

	martinDelay_loop();

	appendVersion();

	max_loss_streak();

	max_win_streak();

	probability();

	tabber();

	asscess();

	bal = $("#pct_balance");
	bal.data('oldVal', bal.val());
	timer = setInterval(function () {
			r_martingale()
		}, martinDelay);

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
			update_counter();
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