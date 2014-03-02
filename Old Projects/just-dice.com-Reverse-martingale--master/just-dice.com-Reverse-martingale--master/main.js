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

var icon_imgage = chrome.extension.getURL('img/icon.png');

var version_c = "1.0.0";

function appendVersion() {
	test_css(' Reverse martingale system' + version_c + ' loaded');
}

function test_css(message) { // shows a message in log area
	document.querySelector(".log").innerHTML = (message);
	setInterval(function () {
		document.querySelector(".log").innerHTML = " ";
	}, 6000);
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
			} else {
				martinDelay = 1500;
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

function probability(){
	setInterval(function () {

		//probability
        cbust3 = 0;
		ccbust1 = parseFloat($("#pct_chance").val());
        ccbust1 = (100 - ccbust1);
		ccbust2 = parseFloat($("#steps").val());
		cBust1 = 1 - ccbust1 / 100;
		cBust2 = Math.pow(cBust1, ccbust2) * 100;

		if (cBust3 != cBust2) {
			cBust3 = cBust2;

			$("#magic_amt").val(cBust2.toFixed(10));

			console.log('   Probability:' + cBust3);
		}

	}, 800);
}

function update_counter() {
	if (check_step == 0)
		     {
			lastBal = parseFloat($("#pct_balance").val());
			check_step = 1;
			        
		}
	$("#win_lose").val((yin_yang2).toFixed(2));
	$("#Bet_amt").val(bet_total);
	profit = parseFloat($("#pct_balance").val()) - lastBal;
    profit = +profit || 0
	$("#pro_fits").val((profit).toFixed(8)); //Update Profit
	console.log('Update counters  ' +
		'   Profit:' + profit +
		'   Bets: ' + bet_total +
		'   win%: ' + yin_yang2);
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

		if (curr_bal > bal.data('oldVal') && $.isNumeric($multiplier.val()) && $.isNumeric($steps.val()) && (current_steps < $steps.val()) && running) { //win step

			//current_steps = 1;
			//$("#pct_bet").val(start_bet);
            
			//Increase our bet by the multiplier
			var new_val = $("#pct_bet").val() * $multiplier.val();
            yin_yang2 = ((yin_yang / bet_total) * 100);

            console.log(' win step b4 sn');
			//get rid of scientific notation
			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));
				console.log('new_val=' + new_val);
			}
            
		    lose1 = 0;
			win1++;            
            current_steps++;
            yin_yang++;
            bet_total++;
            $("#pct_bet").val(new_val);

            
            update_counter();
            $("#a_hi").trigger('click');

		} else if (curr_bal < bal.data('oldVal')) { // loss step

			current_steps = 1;
            $("#pct_bet").val(start_bet);
            
            var new_val = $("#pct_bet").val()
            yin_yang2 = ((yin_yang / bet_total) * 100);
            
            console.log(' lose step b4 sn');
			//get rid of scientific notation
			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));

				console.log('new_val=' + new_val);
			}

            
            
		    lose1++;
            bet_total++;
			win1 = 0;
			

            update_counter();
			$("#a_hi").trigger('click');
            
		} else if (curr_bal > bal.data('oldVal') && (current_steps >= $steps.val()) && running) { //reset from step length
		
        current_steps = 1;
            $("#pct_bet").val(start_bet);
            
            var new_val = $("#pct_bet").val()
            yin_yang2 = ((yin_yang / bet_total) * 100);
            
            console.log(' lose step b4 sn');
			//get rid of scientific notation
			if (String(new_val).indexOf('e') !== -1) {
				var arr = new Array();
				arr = String(new_val).split('e');
				new_val = new_val.toFixed(arr[1].substring(1));

				console.log('new_val=' + new_val);
			}

            
            
		    lose1 = 0;
			win1++;            
            current_steps = 1;
            yin_yang++;
            bet_total++;
            update_counter();
			$("#a_hi").trigger('click');        
        }

		//otherwise we go back to the start
		else { // bust step
			current_steps = 1;
            yin_yang2 = ((yin_yang / bet_total) * 100);
			$("#pct_bet").val(start_bet);
			running = false;
            $("#win_lose").val(yin_yang2);
		}

		// Updated stored value
		bal.data('oldVal', bal.val());
		timer = setInterval(function () {
				r_martingale()
			}, martinDelay);

	} else
		bal.data('oldVal', bal.val());

}

function tabber() {
	        var markup = '<div class="bot-stats"><p><img src="https://i.imgur.com/N6n5UNz.png" width="80" height="80"> Hi Guys and girls thankyou for taking the time to try or use this automated betting system.</p><p> My name is (98066)Nix You can usually find me right here in the chat on JD. If you need to ask anything feel free to, I will help all I can. It has been a lot of fun learning some javascript and it is even more fun trying out new ways (I know trying.) to beat the house at JD.</p><p><strong><u>Multiplyer</u></strong> This is a value used to increase bet on win eg. 2x multiplier will double your bet on a win.</p><p><u><strong>Steps</strong></u>This is the amount of consecutive wins you want the bot to go through before resetting the bet.</p><p><strong><u>probability</u></strong> This is your percentage chance of getting a win streak the length of steps.</p><p><strong><u>Profit display</u></strong> This will show your profit won. If you refresh the page this value will reset.</p><p><strong><u>Win % display</u></strong> This will show wins as a percentage of rolls. You can expect this number to be very close to chance to win.</p><p><u><strong>Max win</strong></u> This will display your max winning streak length.</p><p><u><strong>Max loss</strong></u> This will display your max losing streaklength.</p><p><strong><u>Credits</u></strong> I would like to thank Darby999 for his original script. he was laid up in bed with a broken hip in spring this year and the origins of this script was born. I would also like to thank Wilco for his help with the chat parser and regex </p><p><strong><u>A word of warning</u></strong> Any sort of automated betting system will ultimately contain bugs. Do not ever have more in your balance than you are willing to lose and always use google two factor authentication. Also by no means it this a surefire way of making profit. If you do not understand this please do not use it.</p><p>THIS IS A THIRD PARTY SCRIPT AND IS IN NO WAY AFFILIATED WITH JUST-DICE.COM. JUST-DICE DOES NOT ENDORSE BOTS</p><p>AND AT THE SAME TIME DOES NOT FORBID THEIR USE.</p></div><div class="clear"></div><div class="bot-graph"><p>Check here for updates and new changes or to report issues <A HREF="https://github.com/CriticalNix/just-dice.com">https://github.com/CriticalNix/just-dice.com</A> </p><p align="center" style="border:1px solid; border-color: #505050;">If you win loads or just like this bot consider donating a coffee and a pizza =) ฿ 1Q2yrewqAaxdWHMKkSxTxk61F3c4mRKNR</p></div><p>If you can not donate click a link. It will redirect to a thankyou image on imgur <A HREF="http://cur.lv/4sdxy" target="_blank">http://cur.lv/4sdxy</A><p><u><strong>Gox btc price</strong></u></p><p><img src="https://btcticker.appspot.com/mtgox/1.00btc.png"></p> </p><div class="bot-foot">';
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
		running = true;
		start_bet = $("#pct_bet").val();
		$("#a_hi").trigger('click');
	});
	$run_div.append($run);

	$Stop = $('<button id="c_stop" style="margin-bottom:5px;margin-top:5px;margin-right:5px;margin-left:5px;">Stop</button>');
	$Stop.click(function () {
		running = false;
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
        
	var $label7 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Bets</p>');
	    $Bet_amt = $('<input style="border:1px solid; border-color: #505050;" id="Bet_amt" value="0" class="readonly" />');
	var $bet_end = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	    $row1.append($label7);
	    $row1.append($Bet_amt);
	    $row1.append($bet_end);
    
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
        
	var $label6 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Win %</p>');
	    $test_betS = $('<input style="border:1px solid; border-color: #505050;" id="win_lose" value="0" class="readonly"/>');
	var $numz5 = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	    $row2.append($label6);
	    $row2.append($test_betS);
	    $row2.append($numz5);

	var $row3 = $('<div class="row"/>');        
	var $label5 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Profit</p>');
	    $test_bet = $('<input style="border:1px solid; border-color: #505050;" id="pro_fits" value="0" class="readonly"/>');
	var $numz4 = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	    $row3.append($label5);
	    $row3.append($test_bet);
	    $row3.append($numz4);
        
	var $label9 = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Probability</p>');
	    $magic_amt = $('<input style="border:1px solid; border-color: #505050;" id="magic_amt" value="0" class="readonly" />');
	var $numz8 = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	    $row3.append($label9);
	    $row3.append($magic_amt);
	    $row3.append($numz8);

	var $fieldset = $('<fieldset style="background-color:transparent;border:2px solid; border-color: #505050;"/>');
	var $fieldset2 = $('<fieldset style="background-color:transparent;border:2px solid; border-color: #505050;"/>');

        $simBox1 = $('<div />');
        $simBox2 = $('<div />');

        $simBox1.append($row1);
        $simBox2.append($row2);
        $simBox2.append($row3);

        $fieldset.append($simBox1);
        $fieldset.append($simBox2);

        $button_group.append($r_martingale_button);
        $button_group.append($fieldset);
        $button_group.append($run_div);
        $button_group.append("<div align='center' style='color:white;font-size:8pt;'>Reverse martingale bot</div>");

	$(".container").eq('1').append($container);
	$(".container").eq('1').append('<div style="clear:left;"/>');

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