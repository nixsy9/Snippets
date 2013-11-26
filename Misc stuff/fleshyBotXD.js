var lS_set = function(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};

var lS_get = function(key) {
    var value = localStorage.getItem(key);
    return value && JSON.parse(value);
};

function add_tab(id, text) {
    var $t = $('.tabs');

    if ($t.find('br')
        .length == 0) {
        $t.prepend($('<br><br>'));
    }

    return $t.prepend($('<li><a href="#' + id + '">' + text + '</a></li>'));
}

function jdc_broke_tab() {
    var markup = '<div id="tab_jdcbotcalc" style="display:none"><div class="panel"><h2>Auto Bet</h2><fieldset class="sim"><h3>Brokitude Calculator</h3><div class="row"><p class="llabel">bankroll</p><input id="sim_bank"><p class="rlabel">BTC</p></div><div class="row"><p class="llabel">initial bet</p><input id="sim_inibet"><p class="rlabel">BTC</p></div><div class="row"><p class="llabel">bet chance</p><input id="sim_chance"><p class="rlabel">%</p></div><div class="row"><p class="llabel">extra bet:</p><input id="sim_extrabet"><p class="rlabel">BTC</p></div><button id="sim_run">Calc</button><button id="sim_copytobot">Copy ►</button><br><p id="sim_results"></p></fieldset><fieldset class="bot"><h3>Martingale Better</h3><div class="row"><p class="llabel">initial bet</p><input id="bot_inibet"><p class="rlabel">BTC</p></div><div class="row"><p class="llabel">bet chance</p><input id="bot_chance"><p class="rlabel">%</p></div><div class="row"><p class="llabel">extra bet</p><input id="bot_extrabet"><p class="rlabel">BTC</p></div><div class="row"><p class="llabel">hi<input type="radio" id="bot_hi" name="hi_lo" style="width: 30px;"></p><p>lo<input type="radio" id="bot_lo" name="hi_lo" style="width: 30px;"></p><p class="rlabel">Flip on win<input type="checkbox" id="bot_flipper" name="hi_lo_flip" style="width: 30px;"></p></div><br><button id="bot_copytosim">◄ Copy</button><button id="bot_run">Run</button><button id="bot_stop" disabled style="opacity: 0.5;">Stop</button><button id="bot_stop_win" disabled style="opacity: 0.5;">Stop on Win</button><br><p id="bot_results"></p></fieldset></div><div class="clear"></div><p></p></div>';

    add_tab('tab_jdcbotcalc', 'Auto');

    $(markup)
        .insertAfter('#faq');

    $('#sim_bank')
        .val(lS_get('sim_bank') || $myprofit());
    $('#sim_inibet')
        .val(lS_get('sim_inibet') || '0.00000100');
    $('#sim_chance')
        .val(lS_get('sim_chance') || $('#pct_chance')
        .val());
    $('#sim_extrabet')
        .val(lS_get('sim_extrabet') || '0.00000010');

    $('#sim_run')
        .click(function() {
        lS_set('sim_bank', $('#sim_bank')
            .val());
        lS_set('sim_inibet', $('#sim_inibet')
            .val());
        lS_set('sim_chance', $('#sim_chance')
            .val());
        lS_set('sim_extrabet', $('#sim_extrabet')
            .val());
        $('#sim_results')
            .html(jdc_brokitude(parseFloat($('#sim_bank')
            .val()),
        parseFloat($('#sim_inibet')
            .val()),
        parseFloat($('#sim_chance')
            .val()),
        parseFloat($('#sim_extrabet')
            .val())));
    });

    $('#sim_copytobot')
        .click(function() {
        $('#bot_inibet')
            .val($('#sim_inibet')
            .val());
        $('#bot_chance')
            .val($('#sim_chance')
            .val());
        $('#bot_extrabet')
            .val($('#sim_extrabet')
            .val());
    });

    $('#bot_inibet')
        .val(lS_get('bot_inibet') || '0.00000100');
    $('#bot_chance')
        .val(lS_get('bot_chance') || $('#pct_chance')
        .val());
    $('#bot_extrabet')
        .val(lS_get('bot_extrabet') || '0.00000010');
    $('#bot_lo')
        .prop('checked', true);
    $('#bot_flipper')
        .prop('checked', false);
    //update_stats(true);

    var $bot = $('.bot');
    $('#bot_run')
        .click(function() {
        $bot.find('input')
            .prop('disabled', true)
            .fadeTo('fast', 0.5);
        $('#bot_run')
            .prop('disabled', true)
            .fadeTo('fast', 0.5);
        $('#bot_stop')
            .prop('disabled', false)
            .fadeTo('fast', 1);
        $('#bot_stop_win')
            .prop('disabled', false)
            .fadeTo('fast', 1);
        mbot.start();
    });

    $('#bot_stop')
        .click(function() {
        $bot.find('input')
            .prop('disabled', false)
            .fadeTo('fast', 1);
        $('#bot_run')
            .prop('disabled', false)
            .fadeTo('fast', 1);
        $('#bot_stop')
            .prop('disabled', true)
            .fadeTo('fast', 0.5);
        $('#bot_stop_win')
            .prop('disabled', true)
            .fadeTo('fast', 0.5);
        mbot.stop_now();
    });

    $('#bot_stop_win')
        .click(function() {
        $bot.find('input')
            .prop('disabled', false)
            .fadeTo('fast', 1);
        $('#bot_run')
            .prop('disabled', false)
            .fadeTo('fast', 1);
        $('#bot_stop')
            .prop('disabled', true)
            .fadeTo('fast', 0.5);
        $('#bot_stop_win')
            .prop('disabled', true)
            .fadeTo('fast', 0.5);
        mbot.stop_on_win();
    });

}

function update_stats(update) {
    $bot_results = $('#bot_results');
    if (!$bot_results.html()) {
        $results_markup = 'Current Bet: <span id="curbet"></span><br>\
Current Losing Streak: <span id="streak"></span></br> \
Longest Losing Streak: <span id="long_streak"></span> \
bets with odds <span id=streak_odds></span><br>\
Largest Bet: <span id="bigbet"></span><br>\
Run Profit as of Last Win: <span id="run_profit"></span>';
        $bot_results.html($results_markup);
    }

    $('#curbet')
        .text(mbot.nextbet.toFixed(8));
    $('#streak')
        .text(mbot.streak);
    $('#long_streak')
        .text(mbot.longest_streak);
    $('#bigbet')
        .text(mbot.bigbet.toFixed(8));
    $('#run_profit')
        .text((mbot.$win_balance - mbot.$start_profit)
        .toFixed(8));
    if (update) {
        $('#streak_odds')
            .text((Math.pow(1 - (mbot.$chance / 100), mbot.longest_streak))
            .toFixed(8));
        update = false;
    }
}

var jd_payout = 99;

function jdc_brokitude(bankroll, bet, bet_chance, extra_bet, bet_multiplier, index) {
    bet_multiplier = typeof bet_multiplier !== 'undefined' ? bet_multiplier : jd_payout / (jd_payout - mbot.$chance);
    index = typeof index !== 'undefined' ? index + 1 : 0;

    if (bet + extra_bet === 0) {
        return ("don't <span>infinite loop</span> me bro");
    }

    if (bankroll < bet) {
        return ('bet multiplier:' + bet_multiplier + 'x<br>broke on <span>' + index + '</span> losses.<br>next bet would be: <span>' + bet.toFixed(8) + '</span><br>ending bankroll: <span>' + bankroll.toFixed(8) + '</span><br>view console for full run (ctrl + shift + j)');
    }
    console.log('#' + index + ': ' + bankroll + 'btc - ' + bet + 'btc');
    return jdc_brokitude(bankroll - bet, (bet * bet_multiplier) + extra_bet, bet_chance, extra_bet, bet_multiplier, index);
}




var mbot = {
    stopped: true,
    longest_streak: lS_get('bot_longstreak') || 0,
    bigbet: lS_get('bot_bigbet')
};

mbot.start = function() {
    mbot.$chance = parseFloat($('#bot_chance')
        .val());
    mbot.$inibet = parseFloat($('#bot_inibet')
        .val());
    mbot.$extrabet = parseFloat($('#bot_extrabet')
        .val());
    mbot.$hi = $('#bot_hi')
        .prop('checked');
    mbot.$hi_lo_flip = $('#bot_flipper')
        .prop('checked');
    mbot.$start_profit = parseFloat($('.myprofit')
        .text());

    mbot.stopped = false;
    mbot.streak = 0;

    mbot.bet_multiplier = jd_payout / (jd_payout - mbot.$chance);

    mbot.nextbet = mbot.$inibet;
    mbot.roll();
};

mbot.roll = function() {
    if (mbot.stopped) {
        return;
    }

    var hi_lo = mbot.$hi ? 'hi' : 'lo';

    if (mbot.nextbet > mbot.bigbet) {
        mbot.bigbet = mbot.nextbet;
    }
    if (mbot.streak > mbot.longest_streak) {
        mbot.longest_streak = mbot.streak;
        var new_streak = true;
    }

    update_stats(new_streak);
    socket.emit("bet", csrf, {
        chance: $('#bot_chance')
            .val(),
        bet: mbot.nextbet.toFixed(8),
        which: hi_lo
    });
};

mbot.stop_now = function() {
    mbot.stopped = true;
};

mbot.stop_on_win = function() {
    mbot.stopped_on_win = true;
};

mbot.loser_roll = function() {
    if (mbot.stopped) {
        return;
    }

    mbot.streak += 1;
    mbot.nextbet = (mbot.nextbet * mbot.bet_multiplier) + mbot.$extrabet;
    mbot.roll();
};

mbot.winner_roll = function() {
    if (mbot.stopped) {
        return;
    }

    mbot.$win_balance = parseFloat($('.myprofit')
        .text());
    if (mbot.stopped_on_win) {
        mbot.stopped = true;
        mbot.stopped_on_win = false;
    } else {
        mbot.$hi = mbot.$hi_lo_flip ? -mbot.$hi : mbot.$hi;
        mbot.streak = 0;
        mbot.nextbet = mbot.$inibet;
        mbot.roll();
    }
};

socket.on('losses', mbot.loser_roll);
socket.on('wins', mbot.winner_roll);






var $myprofit = function() {
    return parseFloat($('.myprofit')
        .text());
},
$uid = $('#uid')
    .text();
var $usergraph,
$sitegraph;
var log_limit = 1000;

var betlog = lS_get('betlog') || [$myprofit()],
    siteprofit = lS_get('siteprofit') || [parseFloat($('.sprofitraw')
        .text()
        .replace(/,/g, ''))];


function jdc_loguserbet(data) {
    if (data.uid == $uid) {
        betlog.push($myprofit());
        betlog.length > log_limit && betlog.splice(0, 1);
        lS_set('betlog', betlog);
    }
    $usergraph && $usergraph();
}

function jdc_logsiteprofit(data) {
    siteprofit.push(-data.stats.profit);
    siteprofit.length > log_limit && siteprofit.splice(0, 1);
    lS_set('siteprofit', siteprofit);
    $sitegraph && $sitegraph();
}

socket.on('result', function(data) {
    jdc_loguserbet(data);
    jdc_logsiteprofit(data);
});



//"include" jquery sparkline library for drawing mini-graphs
//original URL http://omnipotent.net/jquery.sparkline/2.1.2/jquery.sparkline.min.js
//author doesn't host through https, and is a stupid dousche about hosting built version on github
$sparklines = 'https://gist.github.com/anonymous/6487343/raw/fa616bf96da5dea63379c3cbc8a153216a0cbb10/jquery.sparkline.min.js';
$.getScript($sparklines, function() {
    $('<td><span id="jdc_siteprofit">Loading...</span></td>')
        .insertAfter($(".sprofitraw")
        .closest('td'));
    $('<td><span id="jdc_userbet">Loading...</span></td>')
        .insertAfter($(".myprofit")
        .closest('td'));
    $sitegraph = function() {
        return $('#jdc_siteprofit')
            .sparkline(siteprofit, {
            width: '98px'
        });
    };
    $usergraph = function() {
        return $('#jdc_userbet')
            .sparkline(betlog, {
            width: '98px'
        });
    };
});

//add the tab without user commands
jdc_broke_tab();