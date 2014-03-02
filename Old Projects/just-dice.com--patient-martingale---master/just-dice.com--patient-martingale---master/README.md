just-dice.com--patient-martingale--
===================================

Martingale system with a delay start that you can use on just-dice.com

THIS IS ALPHA ALPHA SOFTWARE. PLEASE REVIEW THE CODE AND DO NOT HAVE MORE THAN YOU ARE WILLING TO LOSE AS YOUR BALANCE.

Installation
------------

1. This is an extension for Chrome. It will only install on Chrome.
2. Download the repository to a directory of your choice.
2. Type `chrome://extensions/` into the address bar.
3. Make sure `Developer Mode` is checked in the upper right.
4. Click `Load unpacked extensions...` and browse to the directory where you save the repository.
5. Now browse to https://just-dice.com and you should see a new addition for Martingale betting.

or browse to the chrome store to install

https://chrome.google.com/webstore/detail/nixs-just-dice-delayed-ma/cdlacbcppaflenidecmkjhgepibbmbkf

How to Bet
----------
Remember this is alpha alpha software and there should not be any more coins in your account than you are willing to lose.

The `Multiplier` box contains the number your bet will be multiplied by 
The `Steps` box contains the number of iterations the betting strategy will use until either a) a win is accomplished; or b) the number of steps is exceeded. The `delay` box contains the the size of the losing streak that will trigger the martingale. `Test B` box contains the test bet size. `Start Bet` box contains the value used for the first martingale bet.

The chrome extension uses the `Test Bet` to make the initial bet and `Start Bet` as a value to start the martingale when a losing streak of `Delay` is reached.

The idea behind the patient martingale
-----
Getting a loss streak of 4 at 49.5% chance to win is a regular occurance, But getting a loss streak of 23 is unheard of.
I created this in an effort to extend the reach of a standard martingale beyond what `balance` would usually allow. Instead of starting a martingale after the first loss this will wait for a loss streak of x length then start martingale.

try the math

x = chance to win

y = max times you can double up

z = test bet step

standard martingale:  1 - (x/100)^y

patient martingale: 1 - (x/100)^(y + z)

This was the initial thinking behind this. 


Notice
------

THIS IS A THIRD PARTY SCRIPT AND IS IN NO WAY AFFILIATED WITH JUST-DICE.COM. JUST-DICE DOES NOT ENDORSE BOTS

AND AT THE SAME TIME DOES NOT FORBID THEIR USE.
