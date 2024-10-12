 const Tabletop = require('tabletop');

 var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1ZxANNvssnrZ6_7EqjblRFZySbliEX86sVQRaEc0b-Ws/edit?gid=0#gid=0';

function init() {
    Tabletop.init( { key: publicSpreadsheetUrl,
                     callback: showInfo,
                     simpleSheet: false } )
  }

 function showInfo(data, tabletop) {
  // do something with the data
  console.log(JSON.stringify(data, null, 2));
}

//initialise and kickstart the whole thing.
init() ;


//not working any more