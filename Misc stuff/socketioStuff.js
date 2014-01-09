socket.emit("bet", csrf, {bet: 0.0000001, chance: 49.5, which: 'lo'});

// Send a chat
socket.emit("chat", csrf, "hi");

// Respond to a win
socket.on("wins", function (data){
    console.log(data);
}

// Respond to a chat
socket.on("chat", function(text, timestamp){
    chatRe = /<([^>]+)> (.*)/;
    who = text.replace(chatRe, '$1');
    said = text.replace(chatRe, '$2');
    console.log(who);
    console.log(said);
}

//parse chat
socket.on("chat", function (txt, date) {
  console.log(date + txt);
});