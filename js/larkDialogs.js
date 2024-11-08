
function renderDlg_BMEdit(jsonDlg={}){
    let cDialogHTML = `
        <div class="larkDlg">
            <div class="larkDlgHeader">
                <div class="larkDlgTitle">Title goes here</div>
                <div class="larkDlgHeaderBar">
                    <i class="bi-x-square larkBTN"></i>
                </div>
            </div>
            <div class="larkDlgBody">
                <input type="text" id="idBMTitle" name="lname" style="width:100%;height:1.2em;" value="${jsonDlg.bookmarkTitle}" >
                <input type="text" id="idBMURI" name="lname" style="width:100%;height:1.2em;" value="${jsonDlg.bookmarkURL}" >
                <input type="text" id="idBMDescription" name="lname" style="width:100%;height:1.2em;" value="${jsonDlg.bookmarkNote}" >

            </div>
            <div class="larkDlgFooter">
                <button id="idBTNCloseDlg"><i class="bi-x larkBTN"></i>close</button>
                <button id="idBTNDlgCheck"><i class="bi-check2-square larkBTN"></i>check</button>
            </div>
        </div>
    ` ;

    let tagLarkDlg = document.createElement('dialog') ;
    document.body.appendChild(tagLarkDlg) ;
    tagLarkDlg.innerHTML = cDialogHTML ;
    tagLarkDlg.id = 'idLarkDialog' ;
    tagLarkDlg.classList.add('modal') ;
    tagLarkDlg.classList.add('ui-dialog-shadow') ;

    tagLarkDlg.querySelector('#idBTNCloseDlg').addEventListener('click', () => {
        tagLarkDlg.close();
        tagLarkDlg.remove() ;
    });

    tagLarkDlg.querySelector('#idBTNDlgCheck').addEventListener('click', () => {
        tagLarkDlg.close();
        let jsonData = {
            bookmarkID:jsonDlg.bookmarkID,
            bookmark:jsonDlg.bookmark,
            bookmarkTitle:tagLarkDlg.querySelector('#idBMTitle').value,
            bookmarkNote:tagLarkDlg.querySelector('#idBMDescription').value,
            bookmarkURL:tagLarkDlg.querySelector('#idBMURI').value
        } ;
        
        if(jsonDlg.hasOwnProperty('checkFunc')){
            jsonDlg.bookmark.querySelector('#idBMTitle').innerText = jsonData.bookmarkTitle ;
            jsonDlg.bookmark.querySelector('#idBMURL').innerText = jsonData.bookmarkURL ;
            //jsonDlg.bookmark.querySelector('#idBMTitle').innerText = jsonData.bookmarkTitle ;
            eval(jsonDlg.checkFunc)(jsonData) ;
        }
        tagLarkDlg.remove() ;
    });

    tagLarkDlg.showModal();
}





function renderDlg_FolderEdit(jsonDlg={}){
    let cDialogHTML = `
        <div class="larkDlg">
            <div class="larkDlgHeader">
                <div class="larkDlgTitle">Title goes here</div>
                <div class="larkDlgHeaderBar">
                    <i class="bi-x-square larkBTN"></i>
                </div>
            </div>
            <div class="larkDlgBody">
                <input type="text" id="folderName" name="lname" placeholder="${jsonDlg.folderName}" style="width:100%;height:1.5em;">
            </div>
            <div class="larkDlgFooter">
                <button id="idBTNCloseDlg"><i class="bi-x larkBTN"></i>close</button>
                <button id="idBTNDlgCheck"><i class="bi-check2-square larkBTN"></i>check</button>
            </div>
        </div>
    ` ;

    let tagLarkDlg = document.createElement('dialog') ;
    document.body.appendChild(tagLarkDlg) ;
    tagLarkDlg.innerHTML = cDialogHTML ;
    tagLarkDlg.id = 'idLarkDialog' ;
    tagLarkDlg.classList.add('modal') ;
    tagLarkDlg.classList.add('ui-dialog-shadow') ;

    tagLarkDlg.querySelector('#idBTNCloseDlg').addEventListener('click', () => {
        tagLarkDlg.close();
        tagLarkDlg.remove() ;
    });

    tagLarkDlg.querySelector('#idBTNDlgCheck').addEventListener('click', () => {
        tagLarkDlg.close();
        let jsonData = {
            itemID:jsonDlg.folder.dataset.larkID,
            title:tagLarkDlg.querySelector('#folderName').value,
            oldTitle:tagLarkDlg.querySelector('#folderName').placeholder
        } ;
        if(jsonDlg.hasOwnProperty('checkFunc')){
            jsonDlg.folder.querySelector('.folderSummary').querySelector('span').innerText = jsonData.title ;
            eval(jsonDlg.checkFunc)(jsonData) ;
        }
        tagLarkDlg.remove() ;
    });

    tagLarkDlg.showModal();
}



/*
function dlgWorkBench(){
    let tagDlg = document.querySelector('#idDlgWorkbench') ;
    tagDlg.showModal() ;
}



document.querySelector('#idBTNCloseDlg').addEventListener('click',(event)=>{
    let tagDlg = document.querySelector('#idDlgWorkbench') ;
    tagDlg.close() ;
}) ;

*/

//lark Dialog Component

function createLarkDialog(jsonDialog){
    let tagDialog = document.createElement('dialog') ;
    let container = document.querySelector(jsonDialog.cssContainer) ;
    container.appendChild(tagDialog) ;
    container.style.visibility = 'visible' ;

    tagDialog.style.backgroundColor = jsonDialog.theme.backgroundColor ;
    tagDialog.style.borderColor = `${jsonDialog.theme.border}` ;//"300px";

    tagDialog.style.width = `${jsonDialog.layout.width}px` ;//"300px";
    tagDialog.style.height = `${jsonDialog.layout.height}px` ;//"300px";

    tagDialog.dataset.schema = JSON.stringify(jsonDialog) ;
    tagDialog.innerHTML=`
    <style>
        .larkDlg{
            width:100% ;
            height:100% ;
            /*
            padding-left: 10px;
            padding-right: 10px;      
            */              
            display: flex;
            flex-direction: column;
            gap:5px;
        }

        .larkDlgHeader{
            display: flex;
            flex-direction: row;
            /*height:48px ;*/
            align-items: center;
            justify-content: flex-start;
            flex-grow: 0;
            flex-shrink: 0;
        }
        .larkDlgTitle{
            font-size: 1.5em;
            font-weight: 600;
            flex-grow: 1;
        }

        .larkDlgHeaderBar{
            flex-grow: 0;
        }

        .larkDlgBody{
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            width:100% ;
        }

        .larkDlgField{
            width:100% ;
            /*
            padding-left: 10px;
            padding-right: 10px;
            */
            padding-top: 5px;
            padding-bottom: 5px;
            display: flex;
            flex-direction: row;
        }

        .larkDlgFieldLabel{
            width:10% ;
            padding-right: 10px;
            display: flex;
            flex-direction: row;
            justify-content:flex-end;
        }

        .larkDlgFieldContent{
            width:90% ;
        }

        .larkDlgFieldContent input{
            width:100% ;
        }

        .larkDlgFooter{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
            gap:5px;
            height:48px ;

            flex-grow: 0;
            flex-shrink: 0;
        }

        .larkDlgFooter button{
            height:1.5em ;
            background-color: white;
            width: 6em;

        }

        
    </style>
    <div class="larkDlg">
        <div class="larkDlgHeader">
            <div class="larkDlgTitle">${jsonDialog.content.title}</div>
            <div class="larkDlgHeaderBar">
                <i class="bi-x-square larkBTN"></i>
            </div>
        </div>
        <div class="larkDlgBody"></div>
        <div class="larkDlgFooter">
            <button id="idBTNCloseDlg" class="${jsonDialog.theme.font}"><i class="bi-x larkBTN"></i>close</button>
            <button id="idBTNDlgCheck" class="${jsonDialog.theme.font}"><i class="bi-check2-square larkBTN"></i>check</button>
        </div>
    </div>
    ` ;

    let tagBody = tagDialog.querySelector('.larkDlgBody') ;
    for(let i=0;i<jsonDialog.content.fields.length;i++){
        renderField(tagBody,jsonDialog,jsonDialog.content.fields[i]) ;
    }

    tagDialog.querySelector('#idBTNCloseDlg').addEventListener('click',(event)=>{
        tagDialog.close() ;
        recallLarkDialog() ;
        container.style.visibility = 'hidden' ;

    }) ;

    tagDialog.querySelector('#idBTNDlgCheck').addEventListener('click',(event)=>{
        let jsonSchema = JSON.parse(tagDialog.dataset.schema) ;

        let jsonFormData={} ;

        for(let i=0;i<jsonSchema.content.fields.length;i++){
            let cssField = `[data-name="${jsonSchema.content.fields[i].content.name}"]` ;
            let tagField = tagDialog.querySelector(cssField) ;
            let cInput = tagField.querySelector('input').value ;
            if(cInput==''){
                cInput = tagField.querySelector('input').getAttribute("placeholder") ;
            }
            jsonFormData[`${jsonSchema.content.fields[i].content.name}`] =  cInput;
        }
        console.log(jsonFormData) ;
        eval(`${jsonSchema.callback.commitFunc}`)(jsonFormData) ;
        tagDialog.close() ;
        recallLarkDialog() ;
        container.style.visibility = 'hidden' ;

        let ctxScript = '(async () => {await foo1();await foo2();is_script_ended = true; })();';

    }) ;

    tagDialog.querySelector('.bi-x-square').addEventListener('click',(event)=>{
        tagDialog.close() ;
        recallLarkDialog() ;
        container.style.visibility = 'hidden' ;

    }) ;


    tagDialog.id = 'larkDialog001' ;
    tagDialog.show() ;
    return tagDialog.id ;

}

function renderField(tagBody,jsonDialog,jsonField){
    if(jsonField.content.type == 'input.Button'){
        let tagFooter = tagBody.closest('.larkDlg').querySelector('.larkDlgFooter') ;
        let tagButton = document.createElement('button') ;
        tagFooter.appendChild(tagButton) ;
        tagButton.id = jsonField.content.name ;
        tagButton.classList.add(jsonDialog.theme.font) ;
        tagButton.innerHTML=`${jsonField.content.title}` ;
        if(jsonField.content.hasOwnProperty('onClick')){
            tagButton.addEventListener('click',(event)=>{
                console.log(jsonDialog) ;
                eval(jsonField.content.onClick)(jsonDialog) ;
                let container = document.querySelector(jsonDialog.cssContainer) ;
                let tagDialog = tagBody.closest('dialog') ;
                tagDialog.close() ;
                recallLarkDialog() ;
                container.style.visibility = 'hidden' ;
            }) ;
        }
    }else{
        let tagField = document.createElement('div');
        tagField.innerHTML=`
            <div class="larkDlgFieldLabel">
                <label for="idURLServer">${jsonField.label}</label>
            </div>
            <div class="larkDlgFieldContent">
                <input type="text" id="idURLServer" name="idURLServer" placeholder="${jsonField.content.default}" class="${jsonDialog.theme.font}">
            </div>
        ` ;
        tagField.classList.add('larkDlgField') ;
        tagField.dataset.name = jsonField.content.name ;
    
        tagBody.appendChild(tagField) ;
        return tagField ;
    }
}


function recallLarkDialog(){
    let tagDlg = document.querySelector('#larkDialog001') ;
    if(tagDlg){
        tagDlg.remove() ;
    }
}
