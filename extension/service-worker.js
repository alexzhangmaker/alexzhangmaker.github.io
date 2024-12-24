
const larkWatchPost         = ['xueqiu.com','www.google.com','127.0.0.1','newtab'] ;


console.log('service-worker.js') ;

chrome.tabs.onUpdated.addListener(_onUpdateTab); 
chrome.runtime.onInstalled.addListener(_onInstall);
chrome.runtime.onStartup.addListener(_onStartUp);
chrome.runtime.onMessage.addListener(_onMessage);



function _onStartUp(){
  console.log('chrome.runtime.onStartup.addListener') 
}

async function _onInstall(details){

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


}

//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
async function _onUpdateTab(tabId, changeInfo, tab) {
  if (!tab.url) return;

  const url = new URL(tab.url);
  console.log(`_onUpdateTab host:${url.host}`) ;
  if(urlUnderWatch(url.hostname)){
    await chrome.sidePanel.setOptions({
      tabId,
      path: './penguinOptionV3.html',
      enabled: true
    });
  }else{
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({tabId,enabled: false});
  }
}

function urlUnderWatch(host){
  for(let i=0;i<larkWatchPost.length;i++){
    if(larkWatchPost[i]==host)return true ;
  }
  return false ;
}


async function _onMessage(request, sender, sendResponse) {
      
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
}