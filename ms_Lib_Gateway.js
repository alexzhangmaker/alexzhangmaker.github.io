

const larkGatewayDBFile = './public/SQLiteDB/larkGateway.db' ;
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

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

/*
async function _archieveMemo(cNoteID){
    sqlite3.verbose();
    console.log(`_archieveMemo will do ${cNoteID}`) ;
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `UPDATE memo set status="archive" where memoID = ?` ;
        await dbConnection.run(cStmt, [cNoteID]);
    
    } catch (error) {
        console.error(error);
        throw error;
    }
}




async function _newMemoBox(jsonMemoBox){

    sqlite3.verbose();
    try {
        let jsonMemoBoxDB={
            memoBoxID:signpostTools.generateDynamicID(),
            memoBoxTitle:jsonMemoBox.memoBoxTitle,
            memoIDs:JSON.stringify(jsonMemoBox.memoIDs),
        };

        console.log(`_newMemoBox ${jsonMemoBoxDB}`) ;
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `INSERT INTO memoBox (memoBoxID,memoBoxTitle,memoIDs,status) VALUES ( ?,?,?,?)` ;

        await dbConnection.run(cStmt, [jsonMemoBoxDB.memoBoxID,jsonMemoBoxDB.memoBoxTitle,jsonMemoBoxDB.memoIDs,'ready']);
        return jsonMemoBoxDB.memoBoxID ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function _fetchMemoBoxIDs(){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkGatewayDBFile);
        let cStmt = `SELECT memoBoxID FROM memoBox where status!="archive"` ;
        let memoBoxIDs = await dbConnection.all(cStmt, []);
        console.log(memoBoxIDs);
        return memoBoxIDs ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
  

async function _fetchMemoBox(memoBoxID){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(noteDBFile);
        let cStmt = `SELECT * FROM memoBox where memoBoxID = ?` ;
        const jsonMemoBoxDB = await dbConnection.get(cStmt, [memoBoxID]);
        if(jsonMemoBoxDB != undefined){
            let jsonMemoBox={
                memoBoxID:jsonMemoBoxDB.memoBoxID,
                memoBoxTitle:jsonMemoBoxDB.memoBoxTitle,
                memoIDs:JSON.parse(jsonMemoBoxDB.memoIDs),
                external:'tbd'
            } ;
            if(jsonMemoBoxDB.external!=null){
                jsonMemoBox.external = JSON.parse(jsonMemoBoxDB.external)
            }
            
            console.log(jsonMemoBox);
            return jsonMemoBox ;
        }
        return undefined ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
  
  
async function _updateMemoBox(jsonMemoBox){
    sqlite3.verbose();
    try {  
        console.log(`_updateMemoBox ${JSON.stringify(jsonMemoBox,null,3)}`) ;

        const dbConnection = await createDbConnection(noteDBFile);

        let jsonMemoBoxDB={
            memoBoxID:jsonMemoBox.memoBoxID,
            memoBoxTitle:jsonMemoBox.memoBoxTitle,
            memoIDs:JSON.stringify(jsonMemoBox.memoIDs),
        };
    
        console.log(`_updateMemoBox ${jsonMemoBoxDB}`) ;

        let cStmt = `SELECT memoBoxID FROM memoBox where memoBoxID = ?` ;
        let jsonDBNotePre = await dbConnection.get(cStmt, [jsonMemoBox.memoBoxID]);
        if(jsonDBNotePre == undefined){
            console.log(`_updateGraffitiNote: ${jsonMemoBox.memoBoxID} not found `) ;
        }else{
            let cUpdateStmt = `UPDATE memoBox set memoBoxTitle=?, memoIDs=? where memoBoxID = ?` ;
            await dbConnection.run(cUpdateStmt, [jsonMemoBoxDB.memoBoxTitle,
                jsonMemoBoxDB.memoIDs,
                jsonMemoBoxDB.memoBoxID,
            ]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}

  
async function _AddMemo2MemoBox(memoID,memoBoxID){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(noteDBFile);
        let cStmt = `SELECT memoBoxID, memoIDs FROM memoBox where memoBoxID = ?` ;
        let jsonMemoBox = await dbConnection.get(cStmt, [memoBoxID]);
        if(jsonMemoBox == undefined){
            console.log(`_AddMemo2MemoBox: ${memoBoxID} not found `) ;
        }else{
            let memoIDs = JSON.parse(jsonMemoBox.memoIDs) ;
            memoIDs.push(memoID) ;
            let cUpdateStmt = `UPDATE memoBox set memoIDs=? where memoBoxID = ?` ;
            await dbConnection.run(cUpdateStmt, [JSON.stringify(memoIDs),memoBoxID]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}

  
async function _archieveMemoBox(memoBoxID){
    sqlite3.verbose();
    console.log(memoBoxID) ;
    try {  
        const dbConnection = await createDbConnection(noteDBFile);
        let cStmt = `UPDATE memoBox set status="archive" where memoBoxID = ?` ;
        await dbConnection.run(cStmt, [memoBoxID]);
    
    } catch (error) {
        console.error(error);
        throw error;
    }
}
*/


let globalNavigator= {
    "meta": {
       "application": "athena",
       "version": "1.0.01",
       "author": "alexszhang@gmail.com",
       "user": "alexszhang@gmail.com",
       "timestamp": "Mon Aug 21 2023 21:16:43 GMT+0700 (中南半岛时间)"
    },
    "data": {
       "mustHave": [
        /*
          {
             "id": "f007a853-d95f-49a6-8521-c7391fa60079",
             "type": "Gateway.Bookmark",
             "title": "云雀.todos",
             "data": {
                "url":"http://124.156.193.78:8080/app_todo.html",
                "extendData":'any'
            }
          },
          {
             "id": "5820c7df-10db-420d-af7c-cfef7dfa3b61",
             "type": "Gateway.Application",
             "title": "泰语学习",
             "data": {
                "url": "http://127.0.0.1:8081/studyJourney.html"
             }
          }
          */
       ],
       "Folders": [
          {
             "id": "6ed238c6-c85b-422a-bb59-27f367f22ba7",
             "type": "Gateway.Folder",
             "title": "CMU Apps",
             "Contents": [
                {
                   "id": "e8939171-a73b-427c-b3d1-f5e2cea5cd11",
                   "type": "Gateway.Bookmark",
                   "title": "CMU.fb",
                   "data": {
                    "url": "https://www.facebook.com/CMUeProeGrad"
                   }
                },
                {
                   "id": "0c64b9cc-00fb-4be3-a4c3-69fa9303213c",
                   "type": "Gateway.Bookmark",
                   "title": "TFL.CMU",
                   "data": {
                    "url": "https://www.human.cmu.ac.th/department.php?org_id=44f683a84163b3523afe57c2e008bc8c"
                   }
                },
                {
                    "id": "6ed238c6-c85b-422a-bb59-27f367f22ba722",
                    "type": "Gateway.Folder",
                    "title": "CMU Apps--2",
                    "Contents": [
                       {
                          "id": "e8939171-a73b-427c-b3d1-f5e2cea5cd1122",
                          "type": "Gateway.Bookmark",
                          "title": "CMU.fb",
                          "data": {
                            "url": "https://www.facebook.com/CMUeProeGrad"
                          }
                       },
                       {
                          "id": "0c64b9cc-00fb-4be3-a4c3-69fa9303213c22",
                          "type": "Gateway.Bookmark",
                          "title": "TFL.CMU",
                          "data": {
                            "url": "https://www.human.cmu.ac.th/department.php?org_id=44f683a84163b3523afe57c2e008bc8c"
                          }
                       },
                       {
                            "id": "f007a853-d95f-49a6-8521-c7391fa6007w9",
                            "type": "Gateway.Bookmark",
                            "title": "云雀.todos",
                            "data": {
                                "url": "http://124.156.193.78:8080/app_todo.html"
                            }
                        },
                        {
                            "id": "5820c7df-10db-420d-af7c-cfef7dfa3b6w1",
                            "type": "Gateway.Bookmark",
                            "title": "泰语学习",
                            "data": {
                                "url": "http://127.0.0.1:8081/studyJourney.html"
                            }
                        }
                    ]
                 }
             ]
          },
          {
            "id": "0a05ea98-6ebf-41c7-96c1-3b79b908c5c4",
            "type": "Gateway.Folder",
            "title": "signpost.Apps",
            "Contents": [
               {
                  "id": "6b2b6ed5-46ed-4dec-b2dd-ecf0fcc20f43",
                  "type": "Gateway.Bookmark",
                  "title": "TXCloud.Console",
                  "data": {
                    "url": "https://console.cloud.tencent.com/lighthouse/instance/index?rid=1"
                  }
               },
               {
                  "id": "72831c97-e584-4ead-b474-b1b73c0d636b",
                  "type": "Gateway.Bookmark",
                  "title": "assistant.TXCloud",
                  "data": {
                    "url": "http://124.156.193.78:8080/app_todo.html"
                  }
               },
               {
                "id": "0a05ea98-6ebf-41c7-96c1-3b79b908c5c4sss",
                "type": "Gateway.Folder",
                "title": "signpost.Demo",
                "Contents": []
               },
               {
                "id": "0a05ea98-6ebf-41c7-96c1-3b79b908c5c4sssss",
                "type": "Gateway.Folder",
                "title": "signpost.Demo2",
                "Contents": []
               },
               {
                  "id": "2624bb79-f27b-4a6e-907d-bb42e2f2d583",
                  "type": "Gateway.Bookmark",
                  "title": "alex.CF",
                  "data": {
                    "url": "https://dash.cloudflare.com/1b28f415fd10549801f9347b667f16b5/pages/view/larkbird/deployments/new"
                  }
               }
            ]
        }
        ]
    }
};

async function doWork(){
    
    let jsonGateway = {
        user:'alexszhang@gmail.com',
        Gateway:globalNavigator
    } ;
    //await _newGateway(jsonGateway) ;

    let jsonGW = await _fetchGateway(jsonGateway.user) ;
    console.log(JSON.stringify(jsonGW,null,3)) ;
}


//doWork() ;


exports.newGateway             = _newGateway ;
exports.updateGateway            = _updateGateway ;
exports.fetchGateway             = _fetchGateway ;

