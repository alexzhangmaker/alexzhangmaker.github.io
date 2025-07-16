let globalBookmarks=[] ;
let _globalNavigator_={} ;
let globalWhereData='outpost.cache' ;//'outpost.LocalServer';//'outpost.cache' ;

const hostDataService = 'http://127.0.0.1:9988' ;
const localKeyBookmarks='outpost.Bookmarks' ;
const localKeyNavigator='outpost.Navigator' ;


function _apiCollectExistedBookmark(jsonBookmark){
    _checkAndPushUnique_(globalBookmarks,jsonBookmark,'id') ;
}

function _checkAndPushUnique_(jsonArray, newObject, attributeName) {
    // Validate inputs
    if (!Array.isArray(jsonArray)) {
        console.error("The first argument must be an array.");
        return false;
    }

    if (typeof newObject !== 'object' || newObject === null) {
        console.error("The second argument must be an object.");
        return false;
    }

    if (typeof attributeName !== 'string' || attributeName.trim() === '') {
        console.error("The third argument (attributeName) must be a non-empty string.");
        return false;
    }

    // Check if the attribute exists in the new object
    if (!(attributeName in newObject)) {
        console.error(`The new object does not have the attribute '${attributeName}'.`);
        return false;
    }

    const attributeValue = newObject[attributeName];

    // Check if an object with the same attribute value already exists in the array
    const exists = jsonArray.some(item =>
        typeof item === 'object' && item !== null && item[attributeName] === attributeValue
    );

    if (!exists) {
        // If not found, push the new object into the array
        jsonArray.push(newObject);
        console.log(`Object with ${attributeName}: '${attributeValue}' added.`);
        return true;
    }else{
        // If found, do nothing
        console.log(`Object with ${attributeName}: '${attributeValue}' already exists. No action taken.`);
        return false;
    }
}

async function _apiPlusMustHave(title,url){
    if(globalWhereData == 'outpost.cache'){
        await _dataLocal_PlusMustHave(title,url) ;
    }else{
        await _dataRemote_PlusMustHave(title,url) ;
    }
}

async function _dataLocal_PlusMustHave(title,url){
    console.log(_globalNavigator_.jsonMustHave);
   let jsonBookmark={
        "id": crypto.randomUUID(),
        "type": "Gateway.Bookmark",
        "title": title,
        "data": {
            "url": url
        }
    } ;
    _checkAndPushUnique_(_globalNavigator_.jsonMustHave, jsonBookmark, 'title') ;
    console.log(_globalNavigator_.jsonMustHave);
    checkInLocalCache_Navigator() ;
}

async function _dataRemote_PlusMustHave(title,url){
    let jsonBMOperation={
        operation:'addMustHave',
        userID:'alexszhang',
        folderID:'NO NEED',
        jsonBookmark:{
            "id": "TBD",
            "type": "Gateway.Bookmark",
            "title": title,
            "data": {
                "url":url
            }
        }
    } ;

    let urlPlusMustHave = `/newMustHave.V1/` ;

    fetch(urlPlusMustHave, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBMOperation)
    }).then(res => res.json())
    .then(res => console.log(res));
}

//if(globalWhereData=='outpost.cache'){

async function _apiRemoveMustHave(larkID){
    if(globalWhereData=='outpost.cache'){
        return  _dataLocal_RemoveMustHave(larkID);
    }else{
        await _dataRemote_RemoveMustHave(larkID) ;
    }
}

function _dataLocal_RemoveMustHave(larkID){
    console.log(JSON.stringify(_globalNavigator_.jsonMustHave,null,3)) ;
    for(let i=0;i<_globalNavigator_.jsonMustHave.length;i++){
        if(_globalNavigator_.jsonMustHave[i].id == larkID){
            _globalNavigator_.jsonMustHave.splice(i,1) ;
        }
    }
    console.log(JSON.stringify(_globalNavigator_.jsonMustHave,null,3)) ;
    checkInLocalCache_Navigator() ;
}

async function _dataRemote_RemoveMustHave(larkID){
    let jsonBMOperation={
        operation:'removeMustHave',
        userID:'alexszhang',
        folderID:'NO NEED',
        jsonBookmark:{
            "id": larkID//tagBookMark.dataset.larkID //"TBD"//dataset.larkID
        }
    } ;

    let urlPlusMustHave = `/removeMustHave.V1/` ;

    fetch(urlPlusMustHave, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBMOperation)
    }).then(res => res.json())
    .then(res => console.log(res));
}


async function _apiFetchBookmark(folderID){
    if(globalWhereData=='outpost.cache'){
        return  _dataLocal_fetchBookmarks(folderID);
    }else{
        let jsonBookmarks = await _dataRemote_apiFetchBookmark(folderID) ;
        return jsonBookmarks ;
    }
}


function _dataLocal_fetchBookmarks(folderID){
    let jsonBookmarks=[] ;
    globalBookmarks.forEach(bookmark=>{
        if(bookmark.folderID == folderID){
            jsonBookmarks.push(bookmark) ;
        }
    }) ;
    return jsonBookmarks ;
}


async function _dataRemote_apiFetchBookmark(folderID){
    
    let jsonBMOperation={
        operation:'fetchBookmarks',
        userID:'alexszhang',
        folderID:folderID//jsonFolder.id
    } ;
    let urlFetchBMs = `/fetchBookmarkV1.V1/` ;
    let jsonRequest={
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBMOperation,null,3)
    } ;
    let response = await fetch(urlFetchBMs, jsonRequest);
    let jsonBookmarks = await response.json() ;
    console.log(jsonBookmarks) ;
    return jsonBookmarks ;
}


async function _apiCheckRemoveBookmark(bookmarkID){
    if(globalWhereData=='outpost.cache'){
        _dataLocal_CheckRemoveBookmark(bookmarkID) ;
    }else{
        await _dataRemote_CheckRemoveBookmark(folderID) ;
    }
}

function _dataLocal_CheckRemoveBookmark(bookmarkID){
    for(let i=0;i<globalBookmarks.length;i++){
        if(globalBookmarks[i].id == bookmarkID){
            globalBookmarks.splice(i,1) ;
        }
    }
    checkInLocalCache_Bookmarks() ;
}

async function _dataRemote_CheckRemoveBookmark(bookmarkID){
    let jsonBMOperation={
        operation:'removeBM',
        userID:'alexszhang',
        folderID:'not NEED',
        jsonBookmark:{
            "id": bookmarkID//jsonChange.bookmarkID
        }
    } ;

    let urlRemoveBM = `/removeBookmark.V1/` ;
    let jsonRequest={
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonBMOperation,null,3)
    } ;
    console.log(jsonRequest) ;
    let response = await fetch(urlRemoveBM, jsonRequest);
    await response.json() ;
}


async function _apiUpdateUserFolders(jsonNavigator){
    if(globalWhereData=='outpost.cache'){
        _dataLocal_UpdateNavigator() ;
    }else{
        await _dataRemote_UpdateNavigator() ;
    }
}

async function _dataLocal_UpdateNavigator(){
    await checkInLocalCache_Navigator() ;
}

async function _dataRemote_UpdateNavigator(){
    let urlUpdateFolders = `/updateUserFolders.V1/` ;
    let jsonRequest={
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(_globalNavigator_,null,3)
    } ;
    console.log(jsonRequest) ;
    let response = await fetch(urlUpdateFolders, jsonRequest);
    await response.json() ;
}

async function _apiLoadData(){
    if(globalWhereData=='outpost.cache'){
        let dataNavigator = await localforage.getItem(localKeyNavigator);
        let dataBookmarks = await localforage.getItem(localKeyBookmarks);
        if(dataBookmarks!=null && dataNavigator!=null){
            _globalNavigator_ = JSON.parse(dataNavigator) ;
            globalBookmarks = JSON.parse(dataBookmarks) ;
            return _globalNavigator_ ;
        }
    }
    
    let firebaseURL = `https://outpost-8d74e.asia-southeast1.firebasedatabase.app/Portal.json` ;
    let response = await fetch(firebaseURL);
    const jsonPortal = await response.json() ;

    globalBookmarks = jsonPortal.Bookmarks ;
    _globalNavigator_.jsonMeta = jsonPortal.jsonMeta ;
    _globalNavigator_.jsonFolders = jsonPortal.jsonFolders ;
    _globalNavigator_.jsonMustHave = jsonPortal.jsonMustHave ;
    console.log(globalBookmarks) ; 
    console.log(_globalNavigator_) ; 

    await localforage.setItem(localKeyNavigator,JSON.stringify(_globalNavigator_));
    await localforage.setItem(localKeyBookmarks,JSON.stringify(globalBookmarks));
    return _globalNavigator_ ;
}

async function checkInLocalCache_Navigator(){
    await localforage.setItem(localKeyNavigator,JSON.stringify(_globalNavigator_));
}

async function checkInLocalCache_Bookmarks(){
    await localforage.setItem(localKeyBookmarks,JSON.stringify(globalBookmarks));
}