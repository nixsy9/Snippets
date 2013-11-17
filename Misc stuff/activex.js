    var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var FILENAME = 'C:\\Users\\Nix\\Desktop\\save-test\\BetsXML2.xml';
 
    function SaveXML(BetData)
    {  
        var file = fso.CreateTextFile(FILENAME, true);
        file.WriteLine('<?xml version="1.0" encoding="utf-8"?>\n');
        file.WriteLine('<BetsInfo>\n');
 
        for (countr = 0; countr < BetData.length; countr++) {
            file.Write('    <Bets ');
            file.Write('Bet="' + BetData[countr][0] + '" ');
            file.WriteLine('></Bets>\n');
        } // end for countr
 
        file.WriteLine('</BetsInfo>\n');
        file.Close();
 
    } // end SaveXML function --------------------
 
    function LoadXML(xmlFile)
    {
        xmlDoc.load(xmlFile);
        return xmlDoc.documentElement;
    } //end function LoadXML()
 
    function initialize_array()
    {
        var Bets = new Array();
        var noFile = true;
        var xmlObj;
        if (fso.FileExists(FILENAME))
        {
            xmlObj = LoadXML(FILENAME);
            noFile = false;
            } // if
        else
        {
            xmlObj = LoadXML("BetsXML.xml");
            //alert("local" + xmlObj);
            } // end if
 
        var BetCount = 0;
        while (BetCount < xmlObj.childNodes.length)
        {
            var tmpBets = new Array(xmlObj.childNodes(BetCount).getAttribute("Bet")
            Bets.push(tmpBets);
            BetCount++;
             }   //end while
        if (noFile == false)
            fso.DeleteFile(FILENAME);
        SaveXML(Bets);
    }   // end function initialize_array()