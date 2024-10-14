

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


/*
async function _newMemo(jsonMemo){

    sqlite3.verbose();
    try {
        let jsonMemoDB={
            memoID:signpostTools.generateDynamicID(),
            timeStamp:jsonMemo.timeStamp,
            memoType:jsonMemo.memoType,
            about:jsonMemo.about,
            memo:JSON.stringify(jsonMemo.memo),
            refer:JSON.stringify(jsonMemo.refer),
            tags:JSON.stringify(jsonMemo.tags)
        };

        console.log(jsonMemoDB) ;
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `INSERT INTO memo (memoID,timeStamp,memoType,about,memo,refer,tags,status) VALUES ( ?,?,?,?,?,?,?,?)` ;

        await dbConnection.run(cStmt, [
            jsonMemoDB.memoID,
            jsonMemoDB.timeStamp,
            jsonMemoDB.memoType,
            jsonMemoDB.about,
            jsonMemoDB.memo,
            jsonMemoDB.refer,
            jsonMemoDB.tags,
            'ready']);
        return jsonMemoDB.memoID ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
*/


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
            console.log(jsonGateway);
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


async function _addBookmark(jsonAddBookmark){
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
}


//doWork() ;


exports.newGateway               = _newGateway ;
exports.updateGateway            = _updateGateway ;
exports.fetchGateway             = _fetchGateway ;
exports.addBookmark              = _addBookmark ;

