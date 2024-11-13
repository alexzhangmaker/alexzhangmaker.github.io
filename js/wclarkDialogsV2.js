


//lark Dialog Component

function createLarkDialog(jsonDialog){
    let tagDialog = document.createElement('dialog') ;
    let container = document.querySelector(jsonDialog.cssContainer) ;
    if(container!=null){
        container.appendChild(tagDialog) ;
        container.style.visibility = 'visible' ;    
    }else{
        container = document.createElement('div') ;
        document.body.appendChild(container) ;
        container.appendChild(tagDialog) ;
        container.style.visibility = 'visible' ;    
    }
    container.style.position = 'absolute';
    container.style.right = null;
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.width = "800px";
    container.style.background="#111";
    container.style.height = "400px";
    container.style.backgroundColor="transparent";
    container.style.marginTop = "-200px" ;
    container.style.marginLeft = "-400px" ;
    container.style.borderRadius = "5px" ;
    container.style.padding = "10px" ;
    container.style.zIndex = "999" ;

    tagDialog.style.backgroundColor = jsonDialog.theme.backgroundColor ;
    tagDialog.style.borderColor = `${jsonDialog.theme.border}` ;//"300px";

    tagDialog.style.width = `${jsonDialog.layout.width}px` ;//"300px";
    tagDialog.style.height = `${jsonDialog.layout.height}px` ;//"300px";

    tagDialog.dataset.schema = JSON.stringify(jsonDialog) ;
    tagDialog.innerHTML=`
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Asap+Condensed:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
    .asap-condensed-extralight {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 200;
    font-style: normal;
    }

    .asap-condensed-light {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 300;
    font-style: normal;
    }

    .asap-condensed-regular {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 400;
    font-style: normal;
    }

    .asap-condensed-medium {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 500;
    font-style: normal;
    }

    .asap-condensed-semibold {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 600;
    font-style: normal;
    }

    .asap-condensed-bold {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 700;
    font-style: normal;
    }

    .asap-condensed-extrabold {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 800;
    font-style: normal;
    }

    .asap-condensed-black {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 900;
    font-style: normal;
    }

    .asap-condensed-extralight-italic {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 200;
    font-style: italic;
    }

    .asap-condensed-light-italic {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 300;
    font-style: italic;
    }

    .asap-condensed-regular-italic {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 400;
    font-style: italic;
    }

    .asap-condensed-medium-italic {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 500;
    font-style: italic;
    }

    .asap-condensed-semibold-italic {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 600;
    font-style: italic;
    }

    .asap-condensed-bold-italic {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 700;
    font-style: italic;
    }

    .asap-condensed-extrabold-italic {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 800;
    font-style: italic;
    }

    .asap-condensed-black-italic {
    font-family: "Asap Condensed", sans-serif;
    font-weight: 900;
    font-style: italic;
    }
    </style>
    <style>
        .larkDlg{
            width:100% ;
            height:100% ;
            
            padding-top:10px;
            padding-left: 10px;
            padding-right: 10px;      
                       
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
    <div class="larkDlg ${jsonDialog.theme.font}">
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
