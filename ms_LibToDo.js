
const larkToDoDBFile = './SQLiteDB/larkCalendar.db' ;
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { v4: uuidv4 } = require('uuid');

function createDbConnection(filename) {
  return open({
      filename,
      driver: sqlite3.Database
  });
}



async function _newToDo(jsonToDo){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkToDoDBFile);

        {
            //INSERT INTO memo (memoID,timeStamp,memoType,about,memo,refer,tags,status) VALUES ( ?,?,?,?,?,?,?,?)
            let cInsertStmt = `INSERT INTO todoTbl (date,title,project,context,status) VALUES(?,?,?,?,?)` ;
            await dbConnection.run(cInsertStmt, [
                jsonToDo.date,
                jsonToDo.title,
                jsonToDo.project,
                jsonToDo.context,
                'pending'
            ]);
        }
    }catch (error) {
        console.error(error);
        throw error;
    }
}

async function _fetchAllPendingToDos(){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkToDoDBFile);
        let cStmt = `SELECT * FROM todoTbl where status = 'pending' ORDER BY date` ;
        let jsonToDos = await dbConnection.all(cStmt, []);   
        return jsonToDos ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function _fetchPendingToDosOf(project){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkToDoDBFile);
        let cStmt = `SELECT * FROM todoTbl where status = 'pending' AND project = ? ORDER BY date` ;
        let jsonToDos = await dbConnection.all(cStmt, [project]);   
        return jsonToDos ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function _doneWithToDo(jsonToDo){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkToDoDBFile);
        let cStmt = `UPDATE todoTbl SET status='done' where id = ?` ;
        await dbConnection.run(cStmt, [jsonToDo.id]);   
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function doWork(){

    let jsonToDo={
        id:0,
        date:'2024-11-05',
        title:'new UI details-3',
        project:'Penguin.V3',
        context:'TBD',
        status:'pending'
    };
    //await _newToDo(jsonToDo) ;

    //console.log(await _fetchAllPendingToDos()) ;

}

doWork() ;

exports.newToDo                     = _newToDo ;
exports.fetchAllPendingToDos        = _fetchAllPendingToDos ;
exports.fetchPendingToDosOf         = _fetchPendingToDosOf;//_fetchGateway ;
exports.doneWithToDo                = _doneWithToDo ;
