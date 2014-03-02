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
var version_c = "1.0.0";

var icon_imgage = chrome.extension.getURL('img/icon.png');

var IProfit = 0;
var IProfitData = 1;
var bet_data = [];
var bank_data = [];
var toggle = 2;
var profitPS = 0;
var profit_start = 0;
var start_check = 1;
var current_bets = 0;
var betsOld = 0;
var betsPS = 0;
var snd_playing = 0;
var last_prof_check = 0;
var invested = 0;
var start_balance = 0;
var bot_profit = 0;

var version_c = '1.1.4';

var alert_snd = new Audio('https://dl.dropboxusercontent.com/u/27471347/alerts/Air-Raid-Siren-Alert.mp3');

function play_alert() {

	if (snd_playing == 1) {
		return;
	} else {
		snd_playing = 1;
		alert_snd.play();
		alert_snd.currentTime = 0;
		snd_playing = 0;

	}

}
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

function generate_graph2() {
	var res = [];
	for (var i = 0; i < bank_data.length; ++i) {
		if (res.length >= 201) {
			res.shift();
			res.push([i, bank_data[i]])
		} else {
			res.push([i, bank_data[i]])
		}
	}

	return res;
}

function gets_date() { //gets the current date
	var now = new Date();
	var strDateTime = [[AddZero(now.getDate()), AddZero(now.getMonth() + 1), now.getFullYear()].join("/"), [AddZero(now.getHours()), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");

	//Pad given value to the left with "0"
	function AddZero(num) {
		return (num >= 0 && num < 10) ? "0" + num : num + "";
	}
	return strDateTime;
}

function update_graphs() {
	var invest_profit_arr = parseFloat($(".sprofitraw").html().replace(/,/g, ""));
	var bankroll_invested_arr = parseFloat($(".bankroll").html().replace(/,/g, ""));
	var bankroll_invested_arr = bankroll_invested_arr.toFixed(8);

	if (bet_data.length >= 201) {
		bet_data.shift();
		bet_data.push(invest_profit_arr);
	} else {
		bet_data.push(invest_profit_arr);
	}

	if (bank_data.length >= 201) {
		bank_data.shift();
		bank_data.push(bankroll_invested_arr);
	} else {
		bank_data.push(bankroll_invested_arr);
	}

	var plot2 = $.plot("#g2_placeholder", [generate_graph2()], {
			series : {
				shadowSize : 0
			},
			yaxis : {},
			xaxis : {}
		});

	plot2.setData([generate_graph2()]);
	plot2.setupGrid();
	plot2.draw();

	var plot = $.plot("#g_placeholder", [generate_graph()], {
			series : {
				shadowSize : 0
			},
			yaxis : {},
			xaxis : {}
		});

	plot.setData([generate_graph()]);
	plot.setupGrid();
	plot.draw();
}

function invest_all() {
	balance = parseFloat($("#pct_balance").val());
	balance = balance.toFixed(8);
	if (balance > 0.00000001) {
			investations = parseFloat($(".investment").html());
			balance = parseFloat($("#pct_balance").val());
			balance = balance.toFixed(8);

		var invest_send = $('<button id="invest_all" style="width:80px;margin-right:10px;border:1px solid" onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", ' + balance + ');\'></button>');

		console.log('\n' + gets_date() + '\n' +
			'-> invested ' + balance + '\n' +
			'-> profit caught at:' + profit_per);

		$($footer).append(invest_send);
		$("#invest_all").trigger('click');
		invest_send.remove();

			invested = 1;
			
		console.log('invested check:' + invested + '\n')
		
	} else {
		return;
	}
}

function divest_all() {
	balance = parseFloat($("#pct_balance").val());
	balance = balance.toFixed(8);
	if (balance < 0.00000001) {
		var investations = parseFloat($(".investment").html());

		var divest_send = $('<button id="divest_all" style="width:80px;margin-right:10px;border:1px solid" onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("divest", csrf, "all", ' + investations + ');\'></button>');

		console.log('\n' + gets_date() + '\n' +
			'-> divested: ' + investations + '\n' +
			'-> profit caught at:' + profit_per);

		$($footer).append(divest_send);
		$("#divest_all").trigger('click');
		divest_send.remove();


			invested = 0;

		console.log('invested check:' + invested + '\n')

		

	} else {
		return;
	}
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

function anti_idle() {
	idle_toggle = 1

		setInterval(function () {
			if ($('#tab_switch').prop('checked')) {

				if (idle_toggle == 1) {
					$("#b_double").click();
					idle_toggle = 0;
					console.log('clicked 1');
				}
				
				else if (idle_toggle == 0) {
					$("#b_half").click();
					idle_toggle = 1;
					console.log('clicked 0');
				}
			}
		}, 10000);
}

function should_invest() {
	invest_value = parseFloat($("#Invest").val());
	invest_value = invest_value.toFixed(4);
	IProfit = parseFloat($(".sprofitraw").html().replace(/,/g, ""));
	profit_per = (IProfit / profit_start) * 100;
	profit_per = profit_per.toFixed(4);



	if ($('#invest_c').prop('checked') && (profit_per * 100000) < (invest_value * 100000) && invested == 0) {
		//console.log(gets_date() + '   would of invested');
	console.log('invest_value:' + invest_value + ' profit_per:' + profit_per + '--' + (profit_per < invest_value));
		invest_all();
	}
}

function should_divest() {
	divest_value = parseFloat($("#Divest").val());
	divest_value = divest_value.toFixed(4);
	IProfit = parseFloat($(".sprofitraw").html().replace(/,/g, ""));
	profit_per = (IProfit / profit_start) * 100;
	profit_per = profit_per.toFixed(4);
	


	//console.log('profit percentage ' + profit_per);

	if ($('#invest_c').prop('checked') && (profit_per * 100000) > (divest_value * 100000) && invested == 1) {
		//console.log(gets_date() + '   would of divested');
	console.log('divest_value:' + divest_value + ' profit_per:' + profit_per + '--' + (profit_per > divest_value));
		divest_all();
	}
}

//------------------------------------------------------------------- Scientific notation
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

function updateStats() {
	if (start_check == 1) {

		start_check = 0;
		profit_start = parseFloat($(".sprofitraw").html().replace(/,/g, ""));
		IProfit = parseFloat($(".sprofitraw").html().replace(/,/g, ""));
		profitPS = IProfit - profit_start;
		profitPS = profitPS.toFixed(8);
		start_balance = parseFloat($("#pct_balance").val());

	} else {

		IProfit = parseFloat($(".sprofitraw").html().replace(/,/g, ""));
		profitPS = IProfit - profit_start;
		profitPS = profitPS.toFixed(8);

		profit_per = (IProfit / profit_start) * 100;
		profit_per = profit_per.toFixed(4);

		last_prof_check = IProfit - IProfitData;
		last_prof_check = last_prof_check.toFixed(8);

		$("#profitPS").val(profitPS);
		$("#total_profitPS").val(last_prof_check);
		$("#percentageI").val(profit_per);

		if ($('#title_check').prop('checked')) {
			$(document).attr('title', IProfit);
		}

		should_invest();
		should_divest();
		
		
		
		if (invested == 0){ // not invested
		balance = parseFloat($("#pct_balance").val());
		bot_profit = balance - start_balance;
		
		$(".Bot_Profit").html('฿' + bot_profit.toFixed(8));

		}
		
		if (invested == 1){
		investations = parseFloat($(".investment").html());
		bot_profit = investations - start_balance;

		$(".Bot_Profit").html('฿ ' + bot_profit.toFixed(8));
		}		
		

		if ($('#whale_check').prop('checked')) {

			man_teh_harpoon = $whaletPS.val();
			console.log('mthp:' + last_prof_check);
			if (last_prof_check < 0) {
				last_prof_check = Math.abs(last_prof_check);
				console.log('mthp:' + man_teh_harpoon);
			}
			if (last_prof_check >= man_teh_harpoon && man_teh_harpoon > 0) {
				play_alert();
			}

		}
	}
}

function updateIprofit() {
	//IProfitData = 1;

	setInterval(function () {
		IProfit = parseFloat($(".sprofitraw").html().replace(/,/g, ""));

		if (IProfit == IProfitData || isNaN(IProfit)) {
			return;
		} else {
			updateStats();
			update_graphs();
			//console.log('IProfitData:' + IProfitData + ' IProfit:' + IProfit);
			IProfitData = parseFloat($(".sprofitraw").html().replace(/,/g, ""));
		}

	}, 1000);
}

function create_ui() { // creates most of the gui stuff


	///////////////////////////////// chat base buttons ////////////////////////////////////////

	var $chat_send = $('div#chat .chatbase:last-child') //location of chatbase

		var $chat_button_group = $('<div style="width:675px;background-color:#787878 ;border:2px solid; border-color: #505050;" />');

	$toggleGraph = $('<button title="toggle profit graph" style="width:80px;margin-right:10px;border:1px solid" id="fleft chatbutton" >P Graph</button>');
	  $toggleGraph.click(function () {

		$('#chipper3').toggle(700);
	});
	  $chat_button_group.append($toggleGraph);

	$toggleGraph2 = $('<button title="Toggle invest graph" style="width:80px;margin-right:10px;border:1px solid" id="fleft chatbutton" >I Graph</button>');
	  $toggleGraph2.click(function () {

		$('#chipper4').toggle(700);
	});
	  $chat_button_group.append($toggleGraph2);

	$toggleUI = $('<button title="toggleGraph" style="width:80px;margin-right:10px;border:1px solid" id="fleft chatbutton" >GUI</button>');
	  $toggleUI.click(function () {

		$('#chipper').toggle(700);
	});
	  $chat_button_group.append($toggleUI);

	$investAll = $('<button id="invest_all" style="width:80px;margin-right:10px;border:1px solid" onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", $("#invest_code").val());\'>invest all</button>');
	

	$divestAll = $('<button id="divest_all" style="width:80px;margin-right:10px;border:1px solid" onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("divest", csrf, "all", $("#divest_code").val());\'>divest all</button>');

	$chat_button_group.append($investAll);
	$chat_button_group.append($divestAll);

	/////////////////////////////////////////////////////////////////////////////////////////////////
	  
	$container = $('<div id="chipper" class="container"/>');
	var $container2 = $('<div id="chipper2" class="container"/>');
	var $button_group = $('<div style="width:99%;background-color:#787878 ;border:2px solid; border-color: #505050;" class="button_group"/>');
	var $options_group = $('<div style="width:99%;background-color:transparent ;border:0px solid;" class="button_group"/>');
	  $container.append($button_group);
	$container2.append($options_group)

	var $Nix_button = $('<button class="button_label chance_toggle" style="margin-top:5px;margin-right:3px;height:65px;;width:70px;color:transparent;background-color:transparent;border:none;"><img src="' + icon_imgage + '"></button>');
	  $Nix_button.click(function () {
		  
	});

	$reset = $('<button title="This resets stuff" style="margin-right:10px;border:1px solid" id="fleft chatbutton" >update stats</button>');
	  $reset.click(function () {
		updateIprofit();

	});
	  $container.append($reset);

	var $row1 = $('<div class="row"/>');

	var $Investl = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Invest @</p>');
	  $Invest = $('<input style="border:1px solid; border-color: #505050;"class="Invest" id="Invest" value="99.9990" />');
	var $Investe = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	  $row1.append($Investl);
	  $row1.append($Invest);
	$row1.append($Investe);

	var $Divestl = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Divest @</p>');
	  $Divest = $('<input style="border:1px solid; border-color: #505050;" class="Divest" id="Divest" value="100.0010" />');
	var $Diveste = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	  $row1.append($Divestl);
	  $row1.append($Divest);
	$row1.append($Diveste);

	var $whalePSl = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Whale val</p>');
	  $whaletPS = $('<input style="border:1px solid; border-color: #505050;" id="whaletPS" value="5" />');
	var $whalePSe = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	  $row1.append($whalePSl);
	  $row1.append($whaletPS);
	$row1.append($whalePSe);

	var $row2 = $('<div class="row"/>');

	var $profitPSl = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Total</p>');
	  $profitPS = $('<input style="border:1px solid; border-color: #505050;" id="profitPS" value="0" class="readonly" />');
	var $profitPSe = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	  $row2.append($profitPSl);
	  $row2.append($profitPS);
	$row2.append($profitPSe);

	var $profitPS1l = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Last</p>');
	  $profitPS1 = $('<input style="border:1px solid; border-color: #505050;" id="total_profitPS" value="0" class="readonly" />');
	var $profitPS1e = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">฿</p>');
	  $row2.append($profitPS1l);
	  $row2.append($profitPS1);
	$row2.append($profitPS1e);

	var $percentageIl = $('<p style="border:1px solid; border-color: #505050;" class="llabel">Percentage</p>');
	  $percentageI = $('<input style="border:1px solid; border-color: #505050;" id="percentageI" value="0" class="readonly" />');
	var $percentageIe = $('<p style="margin-right:15px;border:1px solid; border-color: #505050;" class="rlabel">%</p>');
	  $row2.append($percentageIl);
	  $row2.append($percentageI);
	$row2.append($percentageIe);

	//////////////////////////////////////////options///////////////////////////////////

	var $o_row1 = $('<div class="row"/>');
	//sound_check
	$whale_check = $('<div><input type="checkbox" value="1" name="whale_check" id="whale_check" /> Whale alarm</div>')
		$o_row1.append($whale_check);

	//invest_check
	$invest_c = $('<div><input type="checkbox" value="1" name="invest_c" id="invest_c" /> Auto Invest/divest</div>')
		$o_row1.append($invest_c);

	//title_check
	$title_check = $('<div><input type="checkbox" value="1" name="title_check" id="title_check" /> Page title displays site profit</div>')
		$o_row1.append($title_check);
		
		
	//tab_switch
	$tab_switch = $('<div><input type="checkbox" value="1" name="tab_switch" id="tab_switch" /> clicks stuff prevents idle timeout.</div>')
		$o_row1.append($tab_switch);

	/////////////////////////////////////////////////////////////////////////////////////

	var $graphDiv = $('<div id="chipper3" style="width:750px;height:100px" class="graph-container"><div style="width:749px;height:99px" id="g_placeholder" class="graph-placeholder"></div></div>'); //profit graph holder
	var $profit_label = $("<div align='center' style='color:white;font-size:8pt;'>Profit</div>");
	var $graphDiv2 = $('<div id="chipper4" style="width:750px;height:100px" class="graph-container2"><div style="width:749px;height:99px" id="g2_placeholder" class="graph2-placeholder"></div></div>'); //invested graph holder
	var $invested_label = $("<div align='center' style='color:white;font-size:8pt;'>Invested</div>");
	var $fieldset = $('<fieldset style="background-color:transparent;border:2px solid; border-color: #505050;"/>');
	var $fieldset_o = $('<fieldset style="background-color:#787878;border:2px solid; border-color: #505050;"/>');

	$footer = $('<div style="position:fixed;bottom:0px;background-color:white;">Private version ' + version_c + '</div>');
	$("body").append($footer);

	$profit_label2 = $('<tr><th>bot</select></th><td><span id="Bot_Profit" class="Bot_Profit">0</span></td></tr>');

	$fieldset.append($graphDiv);
	$fieldset.append($profit_label);
	$fieldset.append($row1);
	$fieldset.append($row2);

	$fieldset.append($graphDiv2);
	$fieldset.append($invested_label);

	$fieldset_o.append($o_row1);

	$chat_send.append($chat_button_group);

	$button_group.append($Nix_button);
	$button_group.append($fieldset);
	$options_group.append($fieldset_o);
	$container.append($container2);
	$button_group.append("<div align='center' style='color:white;font-size:8pt;'>Just-Dice --- Investor-Stats</div>");

	$button_group.append('<a title="Toggles bot option gui" style="margin-left:5px;" id="showhidetrigger2" href="#">options</a>'); //toggle hide for options
	$button_group.append('<a title="Moves GUI" style="margin-left:5px;" id="showhidetrigger4" href="#">Move GUI</a>'); //Moves GUI

	$(document).ready(function () { //move gui
		$('a#showhidetrigger4').click(function () {
			toggle_gui_pos();
		});
	});

	$(document).ready(function () { // toggle hide function for options
		$('#chipper2').hide();
		$('a#showhidetrigger2').click(function () {
			$('#chipper2').toggle(700);
		});
	});

	$clearleft_gui = $('<div style="clear:left;"/>');

	toggle_gui_pos();
}

function toggle_gui_pos() {

	if (toggle == 2) {

		console.log('toggle 2');
		//$(".chatstat").append($toggles_gui);
		$(".chatstat").append($container);
		$(".chatstat").append($clearleft_gui);
		$(".chatstat table tbody").append($profit_label2);
		toggle = 0;

		console.log('toggle 2 now =' + toggle);

	} else if (toggle == 0) {

		console.log('toggle 0');

		//$($toggles_gui).appendTo($(".container").eq('1'));
		$($container).appendTo($(".container").eq('1'));
		$($clearleft_gui).appendTo($(".container").eq('1'));
		toggle = 1;

		console.log('toggle 0 now =' + toggle);

	} else {

		console.log('toggle 1');

		//$($toggles_gui).appendTo($(".chatstat"));
		$($container).appendTo($(".chatstat"));
		$($clearleft_gui).appendTo($(".chatstat"));
		toggle = 0;

		console.log('toggle 1 now =' + toggle);

	}
}

// Where it all starts

$(document).ready(function () {

	create_ui();

	updateIprofit();
	
	anti_idle();

});