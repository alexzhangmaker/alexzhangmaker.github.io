console.log('bookmarking.js');


async function readUserValue(){
    try {
        const value = await localforage.getItem('outPost.User');
        // This code runs once the value has been loaded
        // from the offline store.
        console.log(value);
        if(value==null){
            let cUser = `alexszhang` ;
            localforage.setItem('outPost.User', cUser).then(function (value) {
                // Do other things once the value has been saved.
                console.log(value);
            }).catch(function(err) {
                // This code runs if there were any errors
                console.log(err);
            });
            return jsonURL ;
        }
        return value ;

    } catch (err) {
        // This code runs if there were any errors.
        console.log(err);
    }
}

async function readJSONURL(){
    try {
        const value = await localforage.getItem('outPost');
        // This code runs once the value has been loaded
        // from the offline store.
        console.log(value);
        if(value==null){
            let jsonURL = `http://127.0.0.1:9988/fetchGateway.V1/:alexszhang` ;

            localforage.setItem('outPost', jsonURL).then(function (value) {
                // Do other things once the value has been saved.
                console.log(value);
            }).catch(function(err) {
                // This code runs if there were any errors
                console.log(err);
            });
            return jsonURL ;
        }
        return value ;

    } catch (err) {
        // This code runs if there were any errors.
        console.log(err);
    }
}

document.querySelector('#idBTNFetchBMTree').addEventListener('click',async (event)=>{

    
    //let srcURL = '/fetchGateway.V1/:alexszhang@outlook.com' ;
    let cUser = await readUserValue() ;
    let srcURL = `http://127.0.0.1:9988/fetchGateway.V1/:${cUser}` ;//`https://alexzhangmaker.github.io/json/Gateway.json` ;//`http://127.0.0.1:9988/fetchGateway.V1/:alexszhang@outlook.com` ;
    let response = await fetch(srcURL/*,{mode: 'no-cors'}*/);

    const string = await response.text();
    const jsonUserGateway = string === "" ? {} : JSON.parse(string);

    let tagFolders = document.querySelector('#idFolderSelector') ;
    for(let i=0;i<jsonUserGateway.data.Folders.length;i++){
        renderFolder(tagFolders,jsonUserGateway.data.Folders[i]) ;

    }

    let currentTab = await getCurrentTab() ;
    document.querySelector('#idTitle').value = currentTab.title ;
    document.querySelector('#idURL').value = currentTab.url ;
    document.querySelector('#idComment').value = 'tbd' ;


    //const jsonUserGateway = await response.json();
    console.log(JSON.stringify(jsonUserGateway,null,3)) ; 
    //log2Console(JSON.stringify(jsonUserGateway,null,3)) ;

    //const value = await localforage.getItem('outPost');
    localforage.setItem('outPost', JSON.stringify(jsonUserGateway)).then(function (value) {
        // Do other things once the value has been saved.
        console.log(value);
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });
    

}) ;

function renderFolder(tagParent,jsonFolder){
    if(jsonFolder.type != 'Gateway.Folder')return ;

    let tagFolder = document.createElement('details') ;
    tagParent.appendChild(tagFolder) ;

    tagFolder.innerHTML=`
            <summary>${jsonFolder.title}</summary>
            <article></article>
    ` ;
    tagFolder.dataset.uuid = jsonFolder.id ;
    if(jsonFolder.Contents.length>0){
        let tagContainer = tagFolder.querySelector('article') ;
        for(let i=0;i<jsonFolder.Contents.length;i++){
            renderFolder(tagContainer,jsonFolder.Contents[i]);
        }
    }
    tagFolder.addEventListener('click',(event)=>{
        document.querySelector('#idFolder').value = jsonFolder.title ;
        document.querySelector('#idFolder').dataset.folderID = jsonFolder.id ;
        event.stopPropagation() ;

        document.querySelector('#idBTNSubmit').disabled = false;
    }) ;
}

/*
let jsonAddBookmark={
   operation:'addBookmark',
   parameter:{
      user:'alexszhang@gmail.com',
      folderID:'folder001',
      url:currentTab.url,
      title:currentTab.title,
      description:'this is google'
   }
} ;
*/
/*
document.querySelector('#idBTNAddBookmark').addEventListener('click',async (event)=>{
    let currentTab = await getCurrentTab() ;

    let jsonBookmarkOp={
        operation:'addBookmark',
        parameter:{
            user:await readUserValue() ,
            folderID:document.querySelector('#idFolder').dataset.folderID,
            url:document.querySelector('#idURL').value,
            title:document.querySelector('#idTitle').value,
            description:document.querySelector('#idComment').value
        }
    } ;

    //const responseSW = await chrome.runtime.sendMessage(jsonBookmarkOp);
    //console.log(responseSW);
    //log2Console(JSON.stringify(jsonBookmarkOp)) ;

}) ;
*/
document.querySelector('#idBTNSubmit').addEventListener('click',async (event)=>{
    let jsonBookmarkOp={
        operation:'addBookmark',
        parameter:{
            user:await readUserValue() ,
            folderID:document.querySelector('#idFolder').dataset.folderID,
            url:document.querySelector('#idURL').value,
            title:document.querySelector('#idTitle').value,
            description:document.querySelector('#idComment').value
        }
    } ;

    let addBMURL = `http://127.0.0.1:9988/addBookmark.V1/` ;
    let jsonRequest={
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBookmarkOp,null,3)
    } ;
    console.log(jsonRequest) ;
    let response = await fetch(addBMURL, jsonRequest);
    //let jsonDeckID = await responseSRC.json() ;
}) ;


/*
function log2Console(csLog){
    let tagConsole = document.querySelector('#idConsole') ;
    let tagMsgUL = tagConsole.querySelector('#idConsoleList') ;
    let tagMsg = document.createElement('li') ;
    tagMsgUL.appendChild(tagMsg) ;
    tagMsg.innerText = csLog ;
}
*/


async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}