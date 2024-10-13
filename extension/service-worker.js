console.log('service-worker.js') ;


chrome.runtime.onInstalled.addListener(async function(details){

    /*
    let url = chrome.runtime.getURL('json/athenaBookmarks_V10.json');
    const response = await fetch(url);
    const jsonAthena = await response.json();
    console.log(`initAthenaStorage:${JSON.stringify(jsonAthena,null,3)}`) ;
  
    const cAthenaAllKey = "athenaAllJSON" ;
    let athenaConfig={
        'athenaAllJSON':JSON.stringify(jsonAthena)
    };
  
    await chrome.storage.local.set(athenaConfig);
  
    //initializeDB() ;
    initializeDB(jsonAthena) ;
    */
  
  
  });
  
  
  chrome.runtime.onStartup.addListener(function(){
    console.log('chrome.runtime.onStartup.addListener') 
  });
  
  
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
      
    console.log(request) ;
    let jsonFeedback={
        operation:'feedback'
    } ;
    sendResponse(jsonFeedback);

    
    
    
    /*
     //let srcURL = '/fetchGateway.V1/:alexszhang@outlook.com' ;
     //let srcURL = `http://127.0.0.1:9988/fetchGateway.V1/:alexszhang@outlook.com` ;
     let srcURL = `https://alexzhangmaker.github.io/json/Gateway.json` ;
     
     let response = await fetch(srcURL);
 
     const string = await response.text();
     const jsonUserGateway = string === "" ? {} : JSON.parse(string);
 
     //const jsonUserGateway = await response.json();
     console.log(JSON.stringify(jsonUserGateway,null,3)) ; 
     */
});
  
  