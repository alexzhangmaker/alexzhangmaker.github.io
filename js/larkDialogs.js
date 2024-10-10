
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




function dlgWorkBench(){
    let tagDlg = document.querySelector('#idDlgWorkbench') ;
    tagDlg.showModal() ;
}


document.querySelector('#idBTNCloseDlg').addEventListener('click',(event)=>{
    let tagDlg = document.querySelector('#idDlgWorkbench') ;
    tagDlg.close() ;
}) ;
