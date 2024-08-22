// Define the regex pattern
const todoRegex = /^(x )?(\([A-Z]\) )?(\d{4}-\d{2}-\d{2} )?(.+?)( \d{4}-\d{2}-\d{2})?( \+[\w\u00C0-\uFFFF]+)?( @[\w\u00C0-\uFFFF]+)?( due:\d{4}-\d{2}-\d{2})?$/u;

// Sample todo.txt lines
const todoLines = [
    "(A) Thank 明天Mom for the meatballs @phone",
    "(B) Schedule 明天 Goodwill pickup +Garage张 @phone",
    "x (A) 2012-01-21 2012-01-05 Make resolutions +pager @wechat due:2012-03-01",
    "x (A) 2016-05-20 2016-04-30 call alex@gmail.com for money +USAP @WeChat due:2016-05-30",
    "x (A) 2016-05-20 call alex@gmail.com for money +USAP @WeChat due:2016-05-30"

];

// Test each line
todoLines.forEach((todoLine) => {
    console.log(todoLine) ;
    const match = todoLine.match(todoRegex);

    if (match) {
        // Extract the components
        const completed = match[1] ? match[1].trim() : null;
        const priority = match[2] ? match[2].trim() : null;
        const creationDate = match[3] ? match[3].trim() : null;
        const taskDescription = match[4] ? match[4].trim() : null;
        const secondaryDate = match[5] ? match[5].trim() : null;
        const project = match[6] ? match[6].trim() : null;
        const context = match[7] ? match[7].trim() : null;
        const dueDate = match[8] ? match[8].trim().replace("due:", "") : null;

        // Output the parsed components
        console.log("Completed:", completed);
        console.log("Priority:", priority);
        console.log("Creation Date:", creationDate);
        console.log("Task Description:", taskDescription);
        console.log("Secondary Date:", secondaryDate);
        console.log("Project:", project);
        console.log("Context:", context);
        console.log("Due Date:", dueDate);
        console.log("-----");
    } else {
        console.log("No match found for the todo line.");
        console.log("-----");
    }
});


function parseTODO(csTODO){
    const match = csTODO.match(todoRegex);

    if (match) {
        let jsonTODO={
            csTODO          : csTODO,
            completed       : match[1] ? match[1].trim() : null,
            priority        : match[2] ? match[2].trim() : null,
            creationDate    : match[3] ? match[3].trim() : null,
            taskDescription : match[4] ? match[4].trim() : null,
            secondaryDate   : match[5] ? match[5].trim() : null,
            project         : match[6] ? match[6].trim() : null,
            context         : match[7] ? match[7].trim() : null,
            dueDate         : match[8] ? match[8].trim().replace("due:", "") : null
        } ;
        
        console.log(JSON.stringify(jsonTODO,null,3)) ;
        return jsonTODO ;
    } else {
        console.log("No match found for the todo line.");
        console.log("-----");
        return null ;
    }
}


for(let i=0;i<todoLines.length;i++){
    parseTODO(todoLines[i]) ;
}
