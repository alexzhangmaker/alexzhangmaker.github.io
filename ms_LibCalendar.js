
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



async function loadSchedule(){
    let _Schedule_2024S2=[
        [],
        [
            {
                code:'025134',
                title:'Listen&Speak 2',
                start:'11:00',
                end:'12:30',
                room:'HB7710'
            },{
                code:'004170',
                title:'Thai Culture',
                start:'13:00',
                end:'14:30',
                room:'HB7609'
            }
        ],
        [
            {
                code:'025136',
                title:'Read&Write 2',
                start:'08:00',
                end:'09:30',
                room:'HB7710'
            },{
                code:'025132',
                title:'Thai 2',
                start:'11:00',
                end:'12:30',
                room:'HB7504'
            },{
                code:'601212',
                title:'Nutrition',
                start:'13:00',
                end:'14:30',
                room:'RB3306'
            }
        ],
        [
            {
                code:'702101',
                title:'Finance',
                start:'09:00',
                end:'12:00',
                room:'BAB1322'
            }
        ],
        [
            {
                code:'025134',
                title:'Listen&Speak 2',
                start:'11:00',
                end:'12:30',
                room:'HB7710'
            },{
                code:'004170',
                title:'Thai Culture',
                start:'13:00',
                end:'14:30',
                room:'HB7609'
            }
        ],
        [
            {
                code:'025136',
                title:'Read&Write 2',
                start:'08:00',
                end:'09:30',
                room:'HB7710'
            },{
                code:'025132',
                title:'Thai 2',
                start:'11:00',
                end:'12:30',
                room:'HB7504'
            },{
                code:'601212',
                title:'Nutrition',
                start:'13:00',
                end:'14:30',
                room:'RB3306'
            }
        ],
        []
    ] ;

    //await _newCalendarEvent(jsonEvent2);
    let nYear = 2025 ;
    for(let nMonth=11;nMonth<12;nMonth++){
        //let firstDayofMonth = new Date(nYear, nMonth, 1);
        var lastDayOfMonth = new Date(nYear, nMonth+1, 0);

        for(let nDay=1;nDay<=lastDayOfMonth.getDate();nDay++){
            let strDay = nDay<10? `0${nDay}`:`${nDay}`;
            let strMonth = nMonth<10? `0${nMonth+1}`:`${nMonth+1}`;
            let cDate = new Date(`${nYear}-${strMonth}-${strDay}`);


            let nWeekDay = cDate.getDay() ;
            console.log(`${cDate.toString()}----${nWeekDay}`) ;
            if(nWeekDay==0 || nWeekDay==6) continue ;
            

            let scheduleOfDay = _Schedule_2024S2[nWeekDay] ;
            for(let i=0;i<scheduleOfDay.length;i++){
                let jsonCourse = scheduleOfDay[i] ;

                let jsonEvent={
                    id:0,
                    title:jsonCourse.title,
                    description:`${jsonCourse.code}@${jsonCourse.room}`,
                    start: `${nYear}-${nMonth+1}-${nDay}T${jsonCourse.start}:00`,//'2024-11-07T10:30:00',
                    end: `${nYear}-${nMonth+1}-${nDay}T${jsonCourse.end}:00`,//'2024-11-07T12:30:00',
                    url:'https://www.reg.cmu.ac.th/webreg/en/',
                    extendedProps:{
                        department: 'Humanity@CMU'
                    },
                    color:'#ff0000',
                    status:'pending',
                    /*weekday:nWeekDay*/
                };
                console.log(jsonEvent) ;
                await _newCalendarEvent(jsonEvent);
            }
            
        }
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

    let jsonEvents=[
            {
                title: 'Listen&Speak',
                description: '025134-HB7-710',
                start: '2024-11-11',
                /*end: '2024-11-23',*/
                startTime: '11:00:00',
                endTime: '12:30:00',
                daysOfWeek:[1,4]
            },{
                title: 'Thai Culture',
                description: '004170-HB7-609',
                start: '2024-11-11',
                /*end: '2024-11-23',*/
                startTime: '13:00:00',
                endTime: '14:30:00',
                daysOfWeek:[1,4]
            },{
                title: 'Read&Write',
                description: '025136-HB7-710',
                start: '2024-11-12',
                /*end: '2024-11-23',*/
                startTime: '08:00:00',
                endTime: '09:30:00',
                daysOfWeek:[2,5]
            },{
                title: 'Thai',
                description: '025136-HB7-504',
                start: '2024-11-12',
                /*end: '2024-11-23',*/
                startTime: '11:00:00',
                endTime: '12:30:00',
                daysOfWeek:[2,5]
            },{
                title: 'Nutrition',
                description: '601212-RB3306',
                start: '2024-11-12',
                /*end: '2024-11-23',*/
                startTime: '13:00:00',
                endTime: '14:30:00',
                daysOfWeek:[2,5]
            },{
                title: 'Finance',
                description: '702101-BAB1322',
                start: '2024-11-13',
                /*end: '2024-11-23',*/
                startTime: '09:00:00',
                endTime: '12:00:00',
                daysOfWeek:[3]
            }
            
    ] ;
    //await _newCalendarEvent(jsonEvent2);

    let events= await _fetchAllPendingEvents() ;
    console.log(events);
}

//doWork() ;

//loadSchedule() ;

exports.newCalendarEvent                = _newCalendarEvent ;
exports.fetchAllPendingEvents           = _fetchAllPendingEvents ;
exports.fetchEvent                      = _fetchEvent ;
exports.doneWithEvent                   = _doneWithEvent ;
