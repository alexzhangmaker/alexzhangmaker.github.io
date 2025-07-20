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

/*
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
*/
const localKeyBookmarks='outpost.Bookmarks' ;
const localKeyNavigator='outpost.Navigator' ;

document.querySelector('#idBTNFetchBMTree').addEventListener('click',async (event)=>{
    let dataNavigator = await localforage.getItem(localKeyNavigator);
    let jsonNavigator={} ;
    if(dataNavigator==null){
        let firebaseURL = `https://outpost-8d74e.asia-southeast1.firebasedatabase.app/Portal.json` ;
        let response = await fetch(firebaseURL);
        const jsonPortal = await response.json() ;
        jsonNavigator.jsonMeta = jsonPortal.jsonMeta ;
        jsonNavigator.jsonFolders = jsonPortal.jsonFolders ;
        jsonNavigator.jsonMustHave = jsonPortal.jsonMustHave ;
        console.log(jsonNavigator) ;
        await localforage.setItem(localKeyNavigator,JSON.stringify(jsonNavigator));

        let jsonBookmarks = jsonPortal.Bookmarks ;
        await localforage.setItem(localKeyBookmarks,JSON.stringify(jsonBookmarks));

    }else{
        jsonNavigator = JSON.parse(dataNavigator) ;
        console.log(jsonNavigator) ;
    }
    //let dataBookmarks = await localforage.getItem(localKeyBookmarks);


    let tagFolders = document.querySelector('#idFolderSelector') ;
    for(let i=0;i<jsonNavigator.jsonFolders.length;i++){
        renderFolder(tagFolders,jsonNavigator.jsonFolders[i]) ;
    }

    let currentTab = await getCurrentTab() ;
    document.querySelector('#idTitle').value = currentTab.title ;
    document.querySelector('#idURL').value = currentTab.url ;
    document.querySelector('#idComment').value = 'tbd' ;


    /*
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
    */
    

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
    if(jsonFolder.hasOwnProperty('Contents')==true){
        if(jsonFolder.Contents.length>0){
            let tagContainer = tagFolder.querySelector('article') ;
            for(let i=0;i<jsonFolder.Contents.length;i++){
                renderFolder(tagContainer,jsonFolder.Contents[i]);
            }
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
/*
let jsonBMOperation={
    operation:'add',
    userID:'alexszhang',
    folderID:'ebb666c0-874c-46ce-9fec-2865beb698a2',
    jsonBookmark:{
        "id": "ebb666c0-874c-46ce-9fec-2865beb698a6",
        "type": "Gateway.Bookmark",
        "title": "gridjs.io",
        "data": {
            "url": "https://gridjs.io/docs/"
        }
    }
} ;
*/
document.querySelector('#idBTNSubmit').addEventListener('click',async (event)=>{
    /*
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
    */
    let jsonBMOperation={
        operation:'addBookmark',
        userID:await readUserValue() ,
        folderID:document.querySelector('#idFolder').dataset.folderID,
        jsonBookmark:{
            "id": "TBD",
            "type": "Gateway.Bookmark",
            "title": document.querySelector('#idTitle').value,
            "data": {
                "url": document.querySelector('#idURL').value
            }
        }
    } ;

    let addBMURL = `http://127.0.0.1:9988/addBookmark.V1/` ;
    let jsonRequest={
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBMOperation,null,3)
    } ;
    console.log(jsonRequest) ;
    let response = await fetch(addBMURL, jsonRequest);
    //let jsonDeckID = await responseSRC.json() ;
    window.close();
}) ;




async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}