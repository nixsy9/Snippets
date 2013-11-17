/*
 
karma.coin Script
 
Commands:
start()         - Start the Bot
stopNow()       - Stop the Bot
stopAfterLoss()  - Stop the Bot After Loss
 
USAGE:
start(); // default settings
start({
        initialBet : 0.0001,
        chanceToWin : 85,
        multiplier : 2,
        lossesInRow : 1,
        winsInRow : 10,
        stageOneLeft : 2
}); //options
 
*/
 
//Your don't need to change anything below here
var bStopNow = false;
var bStopAfterWin = false;
 
var initialBet = 0.0001;
var nextBet = initialBet;
var chanceToWin = 85;
var multiplier = 2;
var lossesInRow = 1;
var winsInRow = 10;
var stageOneLeft = 2;
 
var starting;
 
var currentWinsInRow = 0;
var currentLossesInRow = 0;
 
var roll_delay = 1400;//1000 = 1 second
 
var snd = new Audio('http://www.soundjay.com/button/sounds/beep-7.mp3');

function start(options) {
        if (options != undefined) {
                if (options.initialBet != undefined) {
                        initialBet = options.initialBet;
                }
                nextBet = initialBet;
                if (options.chanceToWin != undefined) {
                        chanceToWin = options.chanceToWin;
                }
                if (options.multiplier != undefined) {
                        multiplier = options.multiplier;
                }
                if (options.lossesInRow != undefined) {
                        lossesInRow = options.lossesInRow;
                }
                if (options.multiplier != undefined) {
                        winsInRow = options.winsInRow;
                }
                if (options.stageOneLeft != undefined) {
                        stageOneLeft = options.stageOneLeft;
                }
        }
        starting = parseFloat($('#pct_balance').val());
        setTimeout(roll(), roll_delay);
 
function stopNow() {
    bStopNow = true;
}
 
function stopAfterLoss() {
    bStopAfterWin = true;
}
 
function roll() {
    var hi_lo = 'lo';
   socket.emit("bet", csrf, { chance: chanceToWin.toString(), bet: nextBet.toFixed(8), which: hi_lo });
}
 
function stopping(sp) {
        console.log('');
        console.log('---------------');
        if (sp) {
                snd.play();
                snd.currentTime = 0;
                console.log('Stage 1 complete');
        } else {
                console.log('Forced Stop');
        }
        console.log('Profit: ' + (parseFloat($('#pct_balance').val()) - parseFloat(starting)));
        console.log('---------------');
}
 
socket.on("wins", function (data) {
        if (bStopNow) {
        stopping(false);
        bStopNow = false;
        bStopAfterWin = false;
        return;
    }
   
        currentWinsInRow++;
        currentLossesInRow = 0;
        if (currentWinsInRow >= winsInRow) {
                currentWinsInRow = 0;
                nextBet = initialBet;
                stageOneLeft--;
                if (stageOneLeft <= 0) {
                        stopping(true);
                        return;
                }
        } else {
                nextBet *= multiplier;
        }
   
    setTimeout(roll(), roll_delay);
});
socket.on("losses", function (data) {
        if (bStopNow  || bStopAfterWin)
    {
        stopping(false);
        bStopNow = false;
        bStopAfterWin = false;
        return;
    }
   
        currentLossesInRow++;
        currentWinsInRow = 0;
        if (currentLossesInRow >= lossesInRow) {
                currentLossesInRow = 0;
                nextBet = initialBet;
        }
       
    setTimeout(roll(), roll_delay);
});
socket.on("jderror", function (data) {
    setTimeout(roll(), roll_delay);
});