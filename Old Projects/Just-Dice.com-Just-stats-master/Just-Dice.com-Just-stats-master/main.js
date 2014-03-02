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

var icon_imgage = chrome.extension.getURL('img/icon.png');
var version_c = "1.0.0";

var bal;
var bal2;
var total_won = 0;
var total_lost = 0;
var max_loss = 0;
var max_win = 0;
var bets_input = 0;
var profit = 0;
var balance = 0;
var lastBal = 0;
var start_bal = 0;
var percentWonInput = 0;
var betsInput = 0;
var lose1 = 0;
var win1 = 0;
var last_betid = 0;
var first_run = 0;
var check_step = 0;
var bet_total = 0;
var spin = 0;
var bet_data =[];
var xcount = 1;

function updateBal() {
	bal = $("#pct_balance");

	bal.data('oldVal', bal.val());
	timer = setInterval(function () {
			update_stats()
		}, 100);

}

function generate_graph() {
	var res = [];
	for (var i = 0; i < bet_data.length; ++i) {
		res.push([i, bet_data[i]])
	}

	return res;
}

function update_graphs() {
	var g_bal = $('#pct_balance').val();
	xcount++;
	
	bet_data.push(g_bal);

	var plot = $.plot("#g_placeholder", [generate_graph()], {
			series : {
				shadowSize : 1
			},
			yaxis : {

			},
			xaxis : {

			}
		});

	plot.setData([generate_graph()]);
	//console.log('s ' + generate_graph());
	//console.log('sd' + generate_graph());
	plot.setupGrid();
	plot.draw();
}

function max_loss_streak() { // function to update longest loss streak
	$("#maxLossInput").css("color", "red");
	setInterval(function () {
		if (lose1 > max_loss) {
			max_loss++;
			$("#maxLossInput").val(max_loss);
		} else {
			// nothing here move along XD
		}
	}, 800);
}

function max_win_streak() { //function to update longest win streak
	$("#maxWinInput").css("color", "green");
	setInterval(function () {
		if (win1 > max_win) {
			max_win++;
			$("#maxWinInput").val(max_win);
		} else {
			// nothing here move along XD
		}
	}, 800);
}

function update_stats() {
	if (bal.data('oldVal') != bal.val()) {
		clearInterval(timer);
		var curr_bal = bal.val();

		if (check_step == 0)
			     {
				start_bal = parseFloat($("#pct_balance").val());
				check_step = 1;
				        
			}

		if (curr_bal > bal.data('oldVal')) {
			console.log('win');
			var profit = parseFloat($("#pct_balance").val()) - start_bal;
			balance = parseFloat($("#pct_balance").val());
			lose1 = 0;
			win1++;
			total_won++;
			bet_total++;
			profit_color();
			ratio_color();
			update_graphs();
			console.log('win step ' + 'win1 ' + win1 + ' lose1 ' + lose1 + ' total lost ' + total_lost + ' balance ' + balance + ' bal.data' + bal.data('oldVal') + ' profit ' + profit);
			$("#profitInput").val((profit).toFixed(8));
			$("#betsInput").val(bet_total);
			$("#won").val(total_won);
			percentWonInput = ((total_won / bet_total) * 100);
			$("#percentWonInput").val((percentWonInput).toFixed(2));
			var results = $("div#me .results")[0];
			var result = $(results).children()[0];
			var betid = $($(result).children(".betid")).text();
			var spin = parseInt($($(result).children(".lucky")).text());
			$("#rolledInput").val(spin);
			lastBal = (balance).val;

		} else if (curr_bal < bal.data('oldVal')) {
			console.log('lose');
			var profit = parseFloat($("#pct_balance").val()) - start_bal;
			balance = parseFloat($("#pct_balance").val());
			win1 = 0;
			lose1++;
			total_lost++;
			bet_total++;
			profit_color();
			ratio_color();
			update_graphs();
			console.log('lose step ' + 'win1 ' + win1 + ' lose1 ' + lose1 + ' total lost ' + total_lost + ' balance ' + balance + ' bal.data' + bal.data('oldVal') + ' profit ' + profit);
			$("#profitInput").val((profit).toFixed(8));
			$("#betsInput").val(bet_total);
			$("#lostInput").val(total_lost);
			percentWonInput = ((total_won / bet_total) * 100);
			$("#percentWonInput").val((percentWonInput).toFixed(2));
			var results = $("div#me .results")[0];
			var result = $(results).children()[0];
			var betid = $($(result).children(".betid")).text();
			var spin = parseInt($($(result).children(".lucky")).text());
			$("#rolledInput").val(spin);
			lastBal = (balance).val;
			 
		} else {
			bal.data('oldVal', bal.val());
			profit_color();
			console.log('else');
		}

		bal.data('oldVal', bal.val());
		profit_color()
		timer = setInterval(function () {
				update_stats()
			}, 100);

	} else
		bal.data('oldVal', bal.val());
	profit_color()

}

function ratio_color() {
	c_chance = parseFloat($("#pct_chance").val()) + 0;
	c_ratio = parseFloat($("#pct_chance").val()) + 0;

	if (c_ratio > c_chance) {
		$("#percentWonInput").css("color", "green");
	} else if (c_ratio < c_chance) {
		$("#percentWonInput").css("color", "red");
	} else {
		$("#percentWonInput").css("color", "black");
	}
}

function profit_color() {
    

	profit = parseFloat($("#pct_balance").val()) - start_bal;

	if (profit > 0) {
		$("#profitInput").css("color", "green");
	} else if (profit < 0) {
		$("#profitInput").css("color", "red");
	} else {
		$("#profitInput").css("color", "black");
	}
}

function resetStats() {
	current_bet_num = 0;
	lastBal = 0;
	yin_yang = 0;
	yin_yang2 = 0;
	check_step = 0;
	bet_total = 0;
	win1 = 0;
	lose1 = 0;
	max_win = 0;
	max_loss = 0;
	total_lost = 0;
	profit_color();
	$("#win_lose").val((yin_yang2).toFixed(2)); //Update win %
	$("#pro_fits").val((profit).toFixed(8)); //Update Profit
	$("#Bet_amt").val(bet_total); //Update bet counter
	$("#maxWinInput").val(max_win);
	$("#maxLossInput").val(max_loss);
	$("#lostInput").val(total_lost);
	$("#won").val(total_won);
	$("#betsInput").val(bet_total);
	console.log('reset step ' + 'win1 ' + win1 + ' lose1 ' + lose1 + ' total lost ' + total_lost + ' balance ' + balance + ' bal.data' + bal.data('oldVal'));

}

function create_ui() {

	var $container = $('<div id="chipper" class="container"/>');
	var $button_group = $('<div style="background-color:#787878 ;border:2px solid; border-color: #505050;" class="button_group"/>');
	$container.append($button_group);

	var $martingale_button = $('<button class="button_label chance_toggle" style="margin-top:36px;margin-right:3px;height:65px;;width:70px;color:transparent;background-color:transparent;border:none;"><img src="' + icon_imgage + '"></button>');

	$reset = $('<button title="hi guys" style="margin-right:10px;border:1px solid" id="fleft chatbutton" >reset stats</button>');
	  $reset.click(function () {
		resetStats();
	});
	  $container.append($reset);
		
	$showhidetrigger3  = $('<button title="Toggles bot option gui" style="margin-right:10px;border:1px solid" id="showhidetrigger3" href="#">graph</button>'); //toggle hide for graph
	  $showhidetrigger3.click(function () {
			$('#chipper3').toggle(700);
	});
	  $container.append($showhidetrigger3);

	   var $run_div = $('<div style="background-color:#787878;margin-top:12px;margin-top:3px;border:2px solid; border-color: #505050;" class="button_inner_group"/>');

	var $row1a = $('<div class="row"/>'); ////////////////////////////////////// row 1a

	  var $won = $('<p style="border:1px solid; border-color: #505050;" class="llabel">won</p>');
	  $wonInput = $('<input style="border:1px solid; border-color: #505050;" id="won" class="readonly" value="0"/>');
	  var $wonEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row1a.append($won);
	  $row1a.append($wonInput);
	  $row1a.append($wonEnd);

	var $row1b = $('<div class="row"/>'); ////////////////////////////////////// row 1b

	  var $lost = $('<p style="border:1px solid; border-color: #505050;" class="llabel">lost</p>');
	  $lostInput = $('<input style="border:1px solid; border-color: #505050;" id="lostInput" class="readonly" value="0"/>');
	var $lostEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row1b.append($lost);
	  $row1b.append($lostInput);
	$row1b.append($lostEnd);

	var $row1c = $('<div class="row"/>'); ////////////////////////////////////// row 1c

	  var $percentWon = $('<p style="border:1px solid; border-color: #505050;" class="llabel">win ratio</p>');
	  $percentWonInput = $('<input style="border:1px solid; border-color: #505050;" id="percentWonInput" class="readonly" value="0"/>');
	var $percentWonEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	  $row1c.append($percentWon);
	  $row1c.append($percentWonInput);
	$row1c.append($percentWonEnd);

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

	var $row2c = $('<div class="row"/>'); ////////////////////////////////////////////// row 2c

	  var $profit = $('<p style="border:1px solid; border-color: #505050;" class="llabel">profit</p>');
	  $profitInput = $('<input style="border:1px solid; border-color: #505050;" id="profitInput" class="readonly" value="0"/>');
	var $profitEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	  $row2c.append($profit);
	  $row2c.append($profitInput);
	$row2c.append($profitEnd);

	var $row3a = $('<div class="row"/>'); ///////////////////////////////// row 3a

	  var $bets = $('<p style="border:1px solid; border-color: #505050;" class="llabel">total bets</p>');
	  $betsInput = $('<input style="border:1px solid; border-color: #505050;" id="betsInput" class="readonly" value="0"/>');
	  var $betsEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">#</p>');
	  $row3a.append($bets);
	  $row3a.append($betsInput);
	  $row3a.append($betsEnd);

	var $row3b = $('<div class="row"/>'); ///////////////////////////////// row 3b

	var $graphDiv =$('<div id="chipper3" style="width:750px;height:100px" class="graph-container"><div style="width:750px;height:100px" id="g_placeholder" class="graph-placeholder"></div></div>'); //graph holder  
	var $rolled = $('<p style="border:1px solid; border-color: #505050;" class="llabel">rolled #</p>');
	  $rolledInput = $('<input style="border:1px solid; border-color: #505050;" id="rolledInput" class="readonly" value="0"/>');
	  var $rolledEnd = $('<p style="border:1px solid; border-color: #505050;" class="rlabel">?</p>');
	  $row3b.append($rolled);
	  $row3b.append($rolledInput);
	  $row3b.append($rolledEnd);

	var $fieldset = $('<fieldset style="border:2px solid; border-color: #505050;"/>');
	$fieldset.append($row1a);
	$fieldset.append($row1b);
	$fieldset.append($row1c);

	var $fieldset2 = $('<fieldset style="border:2px solid; border-color: #505050;"/>');
	$fieldset2.append($row2a);
	$fieldset2.append($row2b);
	$fieldset2.append($row2c);

	var $fieldset3 = $('<fieldset style="border:2px solid; border-color: #505050;"/>');
	$fieldset3.append($row3a);
	$fieldset3.append($row3b);
	$fieldset3.append($graphDiv);

	$button_group.append($martingale_button);
	$button_group.append($fieldset);
	$button_group.append($fieldset2);
	$button_group.append($fieldset3);
	$button_group.append($graphDiv);

	$button_group.append("<div align='center' style='color:white;font-size:8pt;'>Just-Dice --- Just-Stats</div>");

	$(".chatstat").append('<a title="Toggles bot gui" id="showhidetrigger" href="#">Show Bot</a>'); //toggles hide for gui
	  $(".chatstat").append($container);
	 $(".chatstat").append('<div style="clear:left;"/>');

	$footer = $('<div style="position:fixed;bottom:0px;background-color:white;">Nix stats v' + version_c + '</div>');
	$("body").append($footer);

	$(document).ready(function () { // toggle hide function for graph
		$('#chipper3').hide();
	});
	
	$(document).ready(function () { // toggle hide function for gui
		$('#chipper').hide();
		$('a#showhidetrigger').click(function () {
			$('#chipper').toggle(700);
		});
	});

}

// Where it all starts

$(document).ready(function () {

	console.log('bot loading...');

	create_ui();

	updateBal();

	max_loss_streak();

	max_win_streak();
	
	update_graphs();

});