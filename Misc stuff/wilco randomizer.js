function randomString() {
        var chars = "0123456789";
        var string_length = 24;
        var randomstring = '';
        for (var i=0; i<string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum,rnum+1);
        }
        random_string = randomstring;
}
 


function clickOk() { $("button.seed_button").click(); }

function clickRandom() { $("button#a_random").click(); } 


window.onerror = function (e, u, l) { return true; }
function captchaResult(response) {

 var delay = [1];
 for (var i=1,l=response.length; i<l; i++) delay.push(delay[i-1] + Math.floor((Math.random()*1)+1));
    $.each(response.split(''), function(i, c){
        setTimeout(function(){
         $("input#new_cseed.seed_input").keydown();
         $("input#new_cseed.seed_input").val($("input#new_cseed.seed_input").val() + c);
         $("input#new_cseed.seed_input").keyup();
         if (i == (delay.length-1)) $($("form#free_btc").children()[1]).children()[0].click();
        }, delay[i]);
    });
 
}
clickRandom();
captchaResult(random_string);
clickOk();