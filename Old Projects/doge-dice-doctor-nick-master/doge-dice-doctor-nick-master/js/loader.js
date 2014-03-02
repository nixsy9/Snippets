var watch = chrome.extension.getURL('js/watch.js');

function includeJS(jsFile) {
    $('head').append($('<script>').attr('type', 'text/javascript').attr('src', jsFile));
}  



$(document).ready(function () {

	console.log('Doctors on standby, ready for server lockup.');
    
    includeJS(watch);

});