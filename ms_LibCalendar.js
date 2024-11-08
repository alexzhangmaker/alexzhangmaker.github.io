
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


async function _newCalendarEvent(jsonEvent){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkToDoDBFile);
        let cInsertStmt = '' ;
        if(jsonEvent.hasOwnProperty('end')){
            cInsertStmt = `INSERT INTO CalendarEventTbl (title,description,start,end,url,extendedProps,color,status) 
                            VALUES(?,?,?,?,?,?,?,?)` ;
            //condition ? value if true : value if false
            await dbConnection.run(cInsertStmt, [
                jsonEvent.title,
                jsonEvent.description,
                jsonEvent.start,
                jsonEvent.end,
                jsonEvent.hasOwnProperty('url') ? jsonEvent.url : '',
                jsonEvent.hasOwnProperty('extendedProps') ? JSON.stringify(jsonEvent.extendedProps) : '',
                jsonEvent.hasOwnProperty('color') ? jsonEvent.color : '',
                'pending'
            ]);
        }else{
            cInsertStmt = `INSERT INTO CalendarEventTbl (title,description,start,startTime,endTime,daysOfWeek,url,extendedProps,color,status) 
                            VALUES(?,?,?,?,?,?,?,?,?,?)` ;
            await dbConnection.run(cInsertStmt, [
                jsonEvent.title,
                jsonEvent.description,
                jsonEvent.start,
                jsonEvent.startTime,
                jsonEvent.endTime,
                jsonEvent.hasOwnProperty('daysOfWeek') ? JSON.stringify(jsonEvent.daysOfWeek) : '[]',
                jsonEvent.hasOwnProperty('url') ? jsonEvent.url : '',
                jsonEvent.hasOwnProperty('extendedProps') ? JSON.stringify(jsonEvent.extendedProps) : '',
                jsonEvent.hasOwnProperty('color') ? jsonEvent.color : '',
                'pending'
            ]);
        }
        
    }catch (error) {
        console.error(error);
        throw error;
    }
}

async function _fetchAllPendingEvents(){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkToDoDBFile);
        let cStmt = `SELECT * FROM CalendarEventTbl where status = 'pending' ORDER BY start` ;
        let jsonEvents = await dbConnection.all(cStmt, []); 
        for(let i=0;i<jsonEvents.length;i++){
            if(jsonEvents[i].extendedProps!='')jsonEvents[i].extendedProps = JSON.parse(jsonEvents[i].extendedProps) ;
            if(jsonEvents[i].daysOfWeek!='')jsonEvents[i].extendedProps = JSON.parse(jsonEvents[i].daysOfWeek) ;
        }
        return jsonEvents ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function _fetchEvent(id){
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkToDoDBFile);
        let cStmt = `SELECT * FROM CalendarEventTbl where id = ?` ;
        let jsonEvent = await dbConnection.get(cStmt, [id]); 
        if(jsonEvent!= undefined){
            if(jsonEvent.extendedProps!='')jsonEvent.extendedProps = JSON.parse(jsonEvent.extendedProps) ;
            if(jsonEvent.daysOfWeek!='')jsonEvent.extendedProps = JSON.parse(jsonEvent.daysOfWeek) ;
        }
        return jsonEvent ;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function _doneWithEvent(jsonEvent){
    console.log(jsonEvent) ;
    sqlite3.verbose();
    try {  
        const dbConnection = await createDbConnection(larkToDoDBFile);
        let cStmt = `UPDATE CalendarEventTbl SET status='done' where id = ?` ;
        await dbConnection.run(cStmt, [jsonEvent.id]);   
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function doWork(){

    let jsonEvent={
        id:0,
        title:'new UI details',
        description:'description',
        start:'2024-11-05',
        startTime:'10:45:00',
        endTime:'12:45:00',
        daysOfWeek:[2,4],
        url:'https://www.google.com',
        extendedProps:{
            department: 'BioChemistry'
        },
        color:'#ff0000',
        status:'pending'
    };
    
    
    let jsonEvent2={
        id:0,
        title:'new UI details',
        description:'description',
        start: '2024-11-07T10:30:00',
        end: '2024-11-07T12:30:00',
        url:'https://www.google.com',
        extendedProps:{
            department: 'BioChemistry'
        },
        color:'#ff0000',
        status:'pending'
    };

    //await _newCalendarEvent(jsonEvent2);

    let events= await _fetchAllPendingEvents() ;
    console.log(events);
}

doWork() ;


exports.newCalendarEvent                = _newCalendarEvent ;
exports.fetchAllPendingEvents           = _fetchAllPendingEvents ;
exports.fetchEvent                      = _fetchEvent ;
exports.doneWithEvent                   = _doneWithEvent ;
