

const larkGatewayDBFile = './SQLiteDB/larkGateway.db' ;
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { v4: uuidv4 } = require('uuid');

function createDbConnection(filename) {
  return open({
      filename,
      driver: sqlite3.Database
  });
}


async function _newGateway(jsonGateway){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);

        let jsonGatewayDB={
            user:jsonGateway.user,
            Gateway:JSON.stringify(jsonGateway.Gateway)
        };
    
        let cStmt = `SELECT * FROM userGateway where user = ?` ;
        let jsonDBPre = await dbConnection.get(cStmt, [jsonGateway.user]);
        if(jsonDBPre != undefined){
            console.log(`_newGateway: ${jsonGateway.user} alreaady existed `) ;
        }else{
            //INSERT INTO memo (memoID,timeStamp,memoType,about,memo,refer,tags,status) VALUES ( ?,?,?,?,?,?,?,?)
            let cInsertStmt = `INSERT INTO userGateway (user,Gateway) VALUES(?,?)` ;
            await dbConnection.run(cInsertStmt, [
                jsonGatewayDB.user,
                jsonGatewayDB.Gateway

            ]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}

async function _fetchGateway(userName){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `SELECT * FROM userGateway where user = ?` ;
        const jsonGatewayDB = await dbConnection.get(cStmt, [userName]);
        if(jsonGatewayDB != undefined){
            let jsonGateway={
                user:userName,
                Gateway:JSON.parse(jsonGatewayDB.Gateway)
            } ;
            //console.log(jsonGateway);
            return jsonGateway ;
        }
        return undefined ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
  

async function _updateGateway(jsonGateway){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);

        let jsonGatewayDB={
            user:jsonGateway.user,
            Gateway:JSON.stringify(jsonGateway.Gateway)
        };
    
        let cStmt = `SELECT * FROM userGateway where user = ?` ;
        let jsonDBPre = await dbConnection.get(cStmt, [jsonGateway.user]);
        if(jsonDBPre == undefined){
            console.log(`_updateGateway: ${jsonGateway.user} not found `) ;
        }else{
            let cUpdateStmt = `UPDATE userGateway set Gateway=? where user = ?` ;
            await dbConnection.run(cUpdateStmt, [
                jsonGatewayDB.Gateway,
                jsonGatewayDB.user
            ]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}



function addBM2Folder(jsonFolder,jsonAddBookmark){
   if(jsonFolder.id == jsonAddBookmark.parameter.folderID){
      let jsonBookMark={
         "id": uuidv4(),
         "type": "Gateway.Bookmark",
         "title": jsonAddBookmark.parameter.title,
         "data": {
            "url": jsonAddBookmark.parameter.url,
            "description":jsonAddBookmark.parameter.description
         }
      } ;
      console.log(`addBM2Folder ${JSON.stringify(jsonBookMark)}`) ;
      jsonFolder.Contents.push(jsonBookMark) ;
      return true ;
   }

   for(let i=0;i<jsonFolder.Contents.length;i++){
      if(jsonFolder.Contents[i].type == 'Gateway.Folder'){
         console.log(`inside will try addBM2Folder ${jsonFolder.Contents[i].id} for ${jsonAddBookmark.parameter.folderID}`);

         let bResult = addBM2Folder(jsonFolder.Contents[i],jsonAddBookmark) ;
         if(bResult == true) return true ;
      }
   }
   
   return false ;
}


async function _addBookmark_V0(jsonAddBookmark){
   sqlite3.verbose();
   try {  
       const dbConnection = await createDbConnection(larkGatewayDBFile);
   
       let cStmt = `SELECT * FROM userGateway where user = ?` ;
       let jsonGatewayDB = await dbConnection.get(cStmt, [jsonAddBookmark.parameter.user]);
       if(jsonGatewayDB == undefined){
           console.log(`_updateGateway: ${jsonAddBookmark.parameter.user} not found `) ;
       }else{
         let jsonGateway = JSON.parse(jsonGatewayDB.Gateway) ;
         for(let i=0;i<jsonGateway.data.Folders.length;i++){
            console.log(`will try addBM2Folder ${jsonGateway.data.Folders[i].id} for ${jsonAddBookmark.parameter.folderID}`);
            let bResult = addBM2Folder(jsonGateway.data.Folders[i],jsonAddBookmark) ;

            jsonGatewayDB.Gateway = JSON.stringify(jsonGateway) ;
            if(bResult == true){
               let cUpdateStmt = `UPDATE userGateway set Gateway=? where user = ?` ;
               await dbConnection.run(cUpdateStmt, [
                  jsonGatewayDB.Gateway,
                  jsonGatewayDB.user
               ]);
               return ;
            } ;
         }
         console.log('fail to _addBookmark') ;
       }
   }catch (error) {
       console.error(error);
       throw error;
   }
}



//===========================================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
async function _newUpdateUserFolder(jsonFolders){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);
    
        let cStmt = `SELECT * FROM userFolders where userID = ?` ;
        let jsonDBPre = await dbConnection.get(cStmt, [jsonFolders.userID]);
        if(jsonDBPre != undefined){
            let cUpdateStmt = `UPDATE userFolders SET 
                                jsonMeta=?,
                                jsonMustHave=?,
                                jsonFolders=? WHERE userID=?
                            ` ;
            await dbConnection.run(cUpdateStmt, [
                JSON.stringify(jsonFolders.jsonMeta),
                JSON.stringify(jsonFolders.jsonMustHave),
                JSON.stringify(jsonFolders.jsonFolders),
                jsonFolders.userID
            ]);
        }else{
            //INSERT INTO memo (memoID,timeStamp,memoType,about,memo,refer,tags,status) VALUES ( ?,?,?,?,?,?,?,?)
            let cInsertStmt = `INSERT INTO userFolders (userID,jsonMeta,jsonMustHave,jsonFolders) VALUES(?,?,?,?)` ;
            await dbConnection.run(cInsertStmt, [
                jsonFolders.userID,
                JSON.stringify(jsonFolders.jsonMeta),
                JSON.stringify(jsonFolders.jsonMustHave),
                JSON.stringify(jsonFolders.jsonFolders)
            ]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}

async function _fetchUserFolders(userID){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `SELECT * FROM userFolders where userID = ?` ;
        let jsonDBPre = await dbConnection.get(cStmt, [userID]);
        if(jsonDBPre != undefined){
            let jsonUserFolder={
                userID:jsonDBPre.userID,
                jsonMeta:JSON.parse(jsonDBPre.jsonMeta),
                jsonMustHave:JSON.parse(jsonDBPre.jsonMustHave),
                jsonFolders:JSON.parse(jsonDBPre.jsonFolders)
            } ;
            return jsonUserFolder ;
        }
        return undefined ;
    }catch (error) {
        console.error(error);
        throw error;
    }
}

/*
let jsonUserFolders={
        userID:jsonUserFolderGW.user,
        jsonMeta:jsonUserFolderGW.Gateway.meta,
        jsonMustHave:jsonUserFolderGW.Gateway.data.mustHave,
        jsonFolders:jsonUserFolderGW.Gateway.data.Folders
    } ;
*/

function _attachBookmark(jsonFolder,jsonBookmarks){
    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].type == 'Gateway.Folder'){
            _attachBookmark(jsonFolder.Contents[i],jsonBookmarks) ;
        }
    }
    for(let i=0;i<jsonBookmarks.length;i++){
        if(jsonBookmarks[i].folderID == jsonFolder.id){
            let jsonBM = {
                "id": jsonBookmarks[i].id,
                "type": "Gateway.Bookmark",
                "title": jsonBookmarks[i].title,
                "data": {
                    "url": jsonBookmarks[i].url
                }
            } ;
            jsonFolder.Contents.push(jsonBM) ;
        }
    }
}

async function _fetchGatewayV1(userID){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `SELECT * FROM userFolders where userID = ?` ;
        const jsonFoldersDB = await dbConnection.get(cStmt, [userID]);
        if(jsonFoldersDB != undefined){
            let jsonGateway={
                user:userID,
                Gateway:{
                    meta:JSON.parse(jsonFoldersDB.jsonMeta),
                    data:{
                        mustHave:JSON.parse(jsonFoldersDB.jsonMustHave),
                        Folders:JSON.parse(jsonFoldersDB.jsonFolders)
                    }
                }
            } ;
            console.log(jsonGateway);

            let cStmt = `SELECT * FROM userBookmarks where userID = ?` ;
            let jsonBookmarks = await dbConnection.all(cStmt, [userID]);

            for(let i=0;i<jsonGateway.Gateway.data.Folders.length;i++){
                _attachBookmark(jsonGateway.Gateway.data.Folders[i],jsonBookmarks) ;
            }
            console.log(JSON.stringify(jsonGateway,null,3)) ;
            return jsonGateway ;
        }
        return undefined ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/*
let jsonBMOperation={
    operation:'addMustHave',
    userID:'alexszhang',
    folderID:'ebb666c0-874c-46ce-9fec-2865beb698a5',
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

async function _newMustHave(jsonBMOperation){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);
    
        let cStmt = `SELECT jsonMustHave FROM userFolders where userID = ?` ;
        let jsonUserFolder = await dbConnection.get(cStmt, [jsonBMOperation.userID]);
        if(jsonUserFolder != undefined){
            console.log(jsonUserFolder) ;
            let jsonMustHave = JSON.parse(jsonUserFolder.jsonMustHave) ;
            jsonBMOperation.jsonBookmark.id = uuidv4() ;
            jsonMustHave.push(jsonBMOperation.jsonBookmark) ;
            let cUpdateStmt = `UPDATE userFolders SET jsonMustHave=? WHERE userID=?` ;
            await dbConnection.run(cUpdateStmt, [JSON.stringify(jsonMustHave),jsonBMOperation.userID]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}

async function _removeMustHave(jsonBMOperation){
    sqlite3.verbose();
    try {
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `SELECT jsonMustHave FROM userFolders where userID = ?` ;
        let jsonUserFolder = await dbConnection.get(cStmt, [jsonBMOperation.userID]);
        if(jsonUserFolder != undefined){
            let jsonMustHave = JSON.parse(jsonUserFolder.jsonMustHave) ;

            let bFlag= false ;
            for(let i=0;i<jsonMustHave.length;i++){
                if(jsonMustHave[i].id == jsonBMOperation.jsonBookmark.id){
                    jsonMustHave.splice(i,1) ;
                    bFlag = true ;
                    break ;
                }
            }
            if(bFlag == false) return ;

            let cUpdateStmt = `UPDATE userFolders SET jsonMustHave=? WHERE userID=?` ;
            await dbConnection.run(cUpdateStmt, [JSON.stringify(jsonMustHave),jsonBMOperation.userID]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}


let jsonBMOperation={
    operation:'updateFolders',//removeFolder, //moveFolderTo
    userID:'alexszhang',
    jsonFolders:[
        {
            "id": "17872a12-f322-440a-9573-c047d374784b",
            "type": "Gateway.Folder",
            "title": "CMU Apps",
            "Contents": []
        }
    ]
} ;
async function _updateFolderV1(jsonBMOperation){
    sqlite3.verbose();
    try {
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `SELECT jsonFolders FROM userFolders where userID = ?` ;
        let jsonDBFolders = await dbConnection.get(cStmt, [jsonBMOperation.userID]);
        if(jsonDBFolders != undefined){
            /*
            let jsonFolders = JSON.parse(jsonDBFolders) ;

            let bFlag= false ;
            for(let i=0;i<jsonFolders.length;i++){
                bFlag = addFolder2(jsonFolders[i],jsonBMOperation.folderID,jsonBMOperation.jsonFolder) ;
                if(bFlag == true) break ;
            }

            if(bFlag == false) return ;

            let cUpdateStmt = `UPDATE userFolders SET jsonFolders=? WHERE userID=?` ;
            await dbConnection.run(cUpdateStmt, [JSON.stringify(jsonFolders),jsonBMOperation.userID]);
            */
            let cUpdateStmt = `UPDATE userFolders SET jsonFolders=? WHERE userID=?` ;
            await dbConnection.run(cUpdateStmt, [JSON.stringify(jsonBMOperation.jsonFolders),jsonBMOperation.userID]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}


/*
let jsonBMOperation={
    operation:'addFolder',//removeFolder, //moveFolderTo
    userID:'alexszhang',
    folderID:'ebb666c0-874c-46ce-9fec-2865beb698a5',
    jsonFolder:{
        "id": "17872a12-f322-440a-9573-c047d374784b",
        "type": "Gateway.Folder",
        "title": "CMU Apps",
        "Contents": []
    }
} ;


function addFolder2(jsonFolder,folderID,jsonFolder2Add){
    if(jsonFolder.id == folderID){
        jsonFolder.Contents.push(jsonFolder2Add) ;
        return true ;
    }

    for(let i=0;i<jsonFolder.Contents.length;i++){
        let bFlag = false ;
        bFlag = addFolder2(jsonFolder.Contents[i],folderID,jsonFolder2Add) ;
        if(bFlag == true) return true ;
    } 
    return false ;
}

async function _addFolderV1(jsonBMOperation){
    sqlite3.verbose();
    try {
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `SELECT jsonFolders FROM userFolders where userID = ?` ;
        let jsonDBFolders = await dbConnection.get(cStmt, [jsonBMOperation.userID]);
        if(jsonDBFolders != undefined){
            let jsonFolders = JSON.parse(jsonDBFolders) ;

            let bFlag= false ;
            for(let i=0;i<jsonFolders.length;i++){
                bFlag = addFolder2(jsonFolders[i],jsonBMOperation.folderID,jsonBMOperation.jsonFolder) ;
                if(bFlag == true) break ;
            }

            if(bFlag == false) return ;

            let cUpdateStmt = `UPDATE userFolders SET jsonFolders=? WHERE userID=?` ;
            await dbConnection.run(cUpdateStmt, [JSON.stringify(jsonFolders),jsonBMOperation.userID]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}

async function _moveFolderV1(jsonBMOperation){
    
}

async function _removeFolderV1(jsonBMOperation){
    
}
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

async function _addBookmarkV1(jsonBMOperation){
    sqlite3.verbose();
    try {
        const dbConnection = await createDbConnection(larkGatewayDBFile);
    
        let cStmt = `SELECT * FROM userBookmarks where userID = ? AND id=?` ;
        let jsonBMDB = await dbConnection.get(cStmt, [jsonBMOperation.userID,jsonBMOperation.jsonBookmark.id]);
        if(jsonBMDB == undefined){
            jsonBMOperation.jsonBookmark.id = uuidv4() ;
            let cInsertStmt = `INSERT INTO userBookmarks (id,folderID,title,url,userID) VALUES(?,?,?,?,?)` ;
            await dbConnection.run(cInsertStmt, [
                jsonBMOperation.jsonBookmark.id,
                jsonBMOperation.folderID,
                jsonBMOperation.jsonBookmark.title,
                jsonBMOperation.jsonBookmark.data.url,
                jsonBMOperation.userID
            ]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
 }


async function _removeBookmarkV1(jsonBMOperation){
    sqlite3.verbose();
    try {
        const dbConnection = await createDbConnection(larkGatewayDBFile);

        let cStmt = `DELETE FROM userBookmarks WHERE id=?` ;
        await dbConnection.run(cStmt, [jsonBMOperation.jsonBookmark.id]);
    }catch (error) {
        console.error(error);
        throw error;
    }
 }
 
/*
let jsonBMOperation={
    operation:'fetchBookmarks',
    userID:'alexszhang',
    folderID:'17872a12-f322-440a-9573-c047d374784b'
} ;
*/
async function _fetchBookmarkV1(jsonBMOperation){
    sqlite3.verbose();
    try {
        const dbConnection = await createDbConnection(larkGatewayDBFile);
    
        let cStmt = `SELECT * FROM userBookmarks where userID=? AND folderID=?` ;
        let jsonBMs = await dbConnection.all(cStmt, [jsonBMOperation.userID,jsonBMOperation.folderID]);
        return jsonBMs ;
    }catch (error) {
        console.error(error);
        throw error;
    }
 }


let globalJSONBookmarks=[] ;
function _splitBookmark(jsonFolder){
    let idBookmarks=[] ;
    for(let i=0;i<jsonFolder.Contents.length;i++){
        if(jsonFolder.Contents[i].type == "Gateway.Folder"){
            _splitBookmark(jsonFolder.Contents[i]) ;
        }
        else{
            console.log('will removeBookmark') ;
            //jsonFolder.Contents[i].splice(i,1) ;
            let jsonBMOperation={
                operation:'add',
                userID:'alexszhang',
                folderID:jsonFolder.id,
                jsonBookmark:jsonFolder.Contents[i]
            } ;

            globalJSONBookmarks.push(jsonBMOperation) ;
            idBookmarks.push(i) ;
        }
    }
    if(idBookmarks.length>0){
        jsonFolder.Contents = jsonFolder.Contents.filter(function(value, index) {
            return idBookmarks.indexOf(index) == -1;
        }) ;
    
        console.log(jsonFolder.Contents) ;
    }
}

async function tool_transformData(userID){
    let jsonUserFolderGW = await _fetchGateway(userID) ;
    let jsonUserFolders={
        userID:jsonUserFolderGW.user,
        jsonMeta:jsonUserFolderGW.Gateway.meta,
        jsonMustHave:jsonUserFolderGW.Gateway.data.mustHave,
        jsonFolders:jsonUserFolderGW.Gateway.data.Folders
    } ;

    console.log(jsonUserFolders.jsonFolders) ;
    for(let i=0;i<jsonUserFolders.jsonFolders.length;i++){
        if(jsonUserFolders.jsonFolders[i].type == "Gateway.Folder"){
            _splitBookmark(jsonUserFolders.jsonFolders[i]) ;
        }
        else{
            jsonUserFolders.jsonFolders.splice(i,1) ;
        }
    }
    
    console.log(JSON.stringify(jsonUserFolders.jsonFolders,null,3)) ;
    console.log(JSON.stringify(globalJSONBookmarks,null,3)) ;

    await _newUpdateUserFolder(jsonUserFolders) ;
    for(i=0;i<globalJSONBookmarks.length;i++){
        await _addBookmarkV1(globalJSONBookmarks[i]) ;
    }
}

async function doWork(){
    /*
    let jsonGateway = {
        user:'alexszhang',
        Gateway:globalNavigator
    } ;
    await _newGateway(jsonGateway) ;
    */

    //let jsonGW = await _fetchGateway(jsonGateway.user) ;
    //console.log(JSON.stringify(jsonGW,null,3)) ;

    //await tool_transformData('alexszhang') ;
    //await _newUpdateUserFolder(jsonFolder) ;
    //let jsonFolder= await _fetchUserFolders('alexszhang') ;
    //console.log(JSON.stringify(jsonFolder,null,3)) ;
    //await _fetchGatewayV1('alexszhang') ;'

    let jsonBMOperation={
        operation:'addMustHave',
        userID:'alexszhang',
        folderID:'6fb7e8e3-fb7b-4735-b691-308c20042537',
        jsonBookmark:{
            "id": "1879fb16-8079-493e-a078-65451e2da2b9",//c6d102e5-5e6d-493c-9b3a-236955391a62
            "type": "Gateway.Bookmark",
            "title": "gridjs.io",
            "data": {
                "url": "https://gridjs.io/docs/"
            }
        }
    } ;
    //await _newMustHave(jsonBMOperation) ;
    //await _removeMustHave(jsonBMOperation) ;
    //await _addBookmarkV1(jsonBMOperation) ;
    //await _removeBookmarkV1(jsonBMOperation) ;
}


//doWork() ;

//======> V0 API
exports.newGateway               = _newGateway ;
exports.updateGateway            = _updateGateway ;
exports.fetchGateway             = _fetchGatewayV1;//_fetchGateway ;
exports.addBookmark              = _addBookmarkV1 ;


//=========>V1 API
exports.newUpdateUserFolderV1               = _newUpdateUserFolder ;
exports.fetchUserFoldersV1                  = _fetchUserFolders ;
exports.newMustHaveV1                       = _newMustHave ;
exports.removeMustHaveV1                    = _removeMustHave ;
exports.updateFolderV1                      = _updateFolderV1 ;
exports.addBookmarkV1                       = _addBookmarkV1 ;
exports.removeBookmarkV1                    = _removeBookmarkV1 ;
exports.fetchBookmarkV1                     =_fetchBookmarkV1 ;

exports.fetchGatewayV1                      = _fetchGatewayV1 ;


