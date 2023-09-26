

function renderDividends(tagParent,title,tableID){
    let template_Portfolio = `
    
        <div class="card-header  bg-transparent border-success">
            <h5>${title}</h5>
        </div>
        <div class="card-body overflow-auto">
            <table id="${tableID}" class="table  table-responsive table-fixed table-hover" width="100%"></table>
        </div>
        <div class="card-footer bg-transparent border-success">
            <div class="footer-container">
            <div class="footer-items">
                <span class="material-symbols-outlined">home</span>
                <span class="material-symbols-outlined">add_circle</span>
                <span class="material-symbols-outlined">login</span>
            </div>
            <div class="footer-items">
                <span class="material-symbols-outlined">key</span>
            </div>
            </div>
        </div>
    
    ` ;

    let tagWebComponent = document.createElement('div') ;
    tagParent.appendChild(tagWebComponent) ;
    tagWebComponent.classList.add("card") ;  
    tagWebComponent.classList.add("mb-3") ;
    tagWebComponent.classList.add("rounded") ; 
    tagWebComponent.classList.add("shadow-lg") ;
    tagWebComponent.innerHTML = template_Portfolio ;

    renderDividendsData(tableID,"dataRec") ;
}



function renderDividendsData(tableID,data){

    const columnsDefWeb=[
        {title:"DATE"},
        {title:"TYPE"},
        {title:"Cashamount"},
        {title:"Declaration"},
        {title:"Record"},
        {title:"Payment"}
      ] ;
      
      const dataRecWeb = [
        ["02/27/2023","CASH","$0.07","02/09/2023","02/28/2023","03/31/2023"],
        ["11/29/2022","CASH","$0.14","11/10/2022","11/30/2022","12/30/2022"],
        ["08/30/2022","CASH","$0.14","08/11/2022","08/31/2022","09/29/2022"],
        ["05/27/2022","CASH","$0.14","05/12/2022","05/31/2022","06/30/2022"],
        ["02/25/2022","CASH","$0.14","02/10/2022","02/28/2022","03/31/2022"]
      ] ; 
    

    $(`#${tableID}`).DataTable( {
        dom: 'Bfrtip',
        columnDefs: [
            {
                targets: 1,
                className: 'noVis'
            }
        ],
        buttons: [
            {
                extend: 'colvis',
                columns: ':not(.noVis)'
            }
        ],
        columns: columnsDefWeb,
        data: dataRecWeb,
        fixedColumns: {right: 1},
        scrollX: true
    });
}

function dividendsInlineStyle(tagWebComponent){

}