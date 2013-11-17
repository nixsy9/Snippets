var WebSocket = require('ws');
var request = require('request');
var fs = require('fs');
 
var sock;
var cj = request.jar();
var url = 'https://just-dice.com';
var h = {'Origin': url};
request = request.defaults({jar: cj, headers: h});
function get_socket() {
  var sessionid;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      request(url + '/socket.io/1', function (e, r, b) {
        sessionid = b.split(":")[0];
        build_socket(sessionid);
      })
    }
  })
}
 
function build_socket(sessionid) {
  var url = "wss://just-dice.com/socket.io/1/websocket/" + sessionid;
  var options = {origin: url};
  sock = new WebSocket(url, options);
  sock.on('error', function(err) { console.log("error", err); });
  sock.on('message', function(msg) {
    if (msg[0] == 5) {
      var m = JSON.parse(msg.substr(4));
      if (message[m.name] != undefined) {
        if (m.args == undefined)
          message[m.name]();
        else
          message[m.name].apply(this, m.args);
      }
    } else if (msg[0] == 2) {
      /* Heartbeat. */
      sock.send('2::');
    }
  });
}
 
var seen = {};
 
var message = {
  init: function(data) {
    if (data.username === null) {
                /* Login */
      console.log("Logging in..");
      login_data = JSON.stringify(
        {name: 'login', args: [data.csrf, username, password]});
      sock.send('5:::' + login_data);
    } else {
      console.log("Logged in as", data.username);
      justdice.csrf = data.csrf;
      justdice.uid = data.uid;
      justdice.house_edge = data.edge;
      //strategy();
         
    }
  },
 
  set_hash: function(cookie_hash) {
    for (var i in cj.cookies) {
      if (cj.cookies[i].name == 'hash') {
        cj.cookies[i].value = cookie_hash;
        break;
      }
    }
  },
 
  reload: function() {
    sock.terminate();
    get_socket();
  },
 
  result: function(result) {
    if (result.uid == justdice.uid) {
      bet_result(result.win, result.lucky / 10000.)
      justdice.waiting_result = false;
    }
  },
 
  chat: function(data, time) {
        var message = data.split("> ")[1];
        var user = data.split("<")[1].split(">")[0];
        var userid = data.substr(1).split(")")[0];
        var cleanMsg = message.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").toLowerCase();
 
        logChat(time + " " + data);
        return;
        seen[user] = new Date();
        seen[userid] = new Date();
 
        if(user == "tfbot"){
                return;
        }
 
        if(cleanMsg == "hi" || cleanMsg == "hi Nix"){
                chat("Hi " + user + "!");
        } else if(message == "!help"){
                chat(":: tfbot's commands: !coinflip !dice !seen ::");
        } else if(message == "!Nix"){
                chat(":: Automated response test!");
        } else if(cleanMsg.indexOf("slap") != -1){
                chat("* slaps " + user + " around with a bit with a large trout");
        } else if(message == "!coinflip"){
                chat("* flips a coin..");
                chat((Math.random() > 0.5 ? ":: It landed on heads!" : ":: It landed on tails!"));
        } else if(message == "!dice"){
                chat(":: The dice landed on " + Math.ceil(Math.random()*6) + "!");
        } else if(message.substr(0, 6) == "!seen "){
                var target = message.split(" ").slice(1).join(" ");
                if(!seen[target]){
                        chat("@" + user + ": I haven't seen " + target);
                } else {
                        chat("@" + user + ": I last saw " + target + " " + timeDifference(new Date().getTime(), seen[target].getTime()) + ".");
                }
        } else if(message.substr(0, 4) == "!btc"){
                request('http://www.whatisthebitcoinprice.com/usd.json', function(error, response, body){
                        if(body){
                                try {
                                        var obj = JSON.parse(body);
                                        chat("@" + user + ": The current Bitcoin price is " + obj['price'] + " USD with " + obj['volume'] + " BTC volume in the past 24 hours.");
                                } catch(err ){
 
                                }
                        }
                });
        } else if(message.indexOf("://") && message.split("://").length == 2){
                request('http://' + message.split("://")[1].split(" ")[0], function(err, response, body){
                        if(body && body.indexOf("<title>") != -1 && body.indexOf("</title>") != -1){
                                var title = body.split("<title>")[1].split("</title>")[0];
                                chat("^ Title of link: " + title);
                        }
                });
        }
  },
  welcome: function(data) {},
  max_profit: function(data) {},
  old_results: function(data) {},
  login_error: function(data) {}
};
function timeDifference(current, previous) {
 
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;
 
    var elapsed = current - previous;
 
    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';  
    }
 
    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';  
    }
 
    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';  
    }
 
    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';  
    }
 
    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';  
    }
 
    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';  
    }
}
function logChat(chat){
        var fileName ="logs/" + new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate() + ".txt";
        fs.exists(fileName, function(exists){
                if(exists){
                        fs.appendFile(fileName, chat + "\n");
                } else {
                        fs.writeFile(fileName, chat + "\n");
                }
        });
}
function bet(win_chance, amount, roll) {
  /* win_chance, amount and roll are all strings.
   * roll is supposed to be either 'hi' or 'lo'. */
  if (justdice.waiting_result)
    return;
  bet_data = JSON.stringify({name: 'bet', args: [justdice.csrf,
          {chance: win_chance, bet: amount, which: roll}]})
  sock.send('5:::' + bet_data);
  justdice.waiting_result = true;
}
function chat(message){
        sock.send('5:::' + JSON.stringify({name: 'chat', args: [justdice.csrf, message]}));
}
 
var justdice = {waiting_result: false};
var username = "yourusername";
var password = "yourpassword";
 
get_socket();
 
 
var still_playing = true;
function strategy() {
  /* This will be called after login and after each bet result. */
  if (still_playing) {
    bet('50', '0', 'hi');
  } else {
    console.log('Ending..');
    sock.terminate();
  }
}
function bet_result(win, lucky) {
  justdice.waiting_result = false;
  console.log(">>", win, lucky);
  if (win != true) {
    still_playing = false;
  }
  strategy();
}