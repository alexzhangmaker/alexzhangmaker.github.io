

function renderPortfolio(tagParent,title,tableID){
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

    renderPortfolioData(tableID,"dataRec") ;
}



function renderPortfolioData(tableID,data){

    const columnsDefWeb=[
        {title:"TICKER"},
        {title:"SHARES"},
        {title:"PRICE"},
        {title:"P/L($)"},
        {title:"P/L(%)"},
        {title:"EQUITY"},
        {title:"MARKET"},
        {title:"AVG PRICE"},
        {title:"DIV YIELD"},
        {title:"ANN DIV"},
        {title:"EARNING/s"},
        {title:"FFO/s"},
        {title:"DEBT/s"},
        {
          defaultContent: '<span class="material-symbols-outlined">delete</span>'
         },
      ] ;
      
      const dataRecWeb = [
        ["BON","1000","32.45","0.24","6.2%","324,500","324,500","30.23","4.5%","0.32","3.2","3.6","2.4"],
        ["BOM","1000","32.45","0.24","6.2%","324,500","324,500","30.23","4.5%","0.32","3.2","3.6","2.4"],
        ["BOX","1000","32.45","0.24","6.2%","324,500","324,500","30.23","4.5%","0.32","3.2","3.6","2.4"],
        ["BOP","1000","32.45","0.24","6.2%","324,500","324,500","30.23","4.5%","0.32","3.2","3.6","2.4"],
        ["BPO","1000","32.45","0.24","6.2%","324,500","324,500","30.23","4.5%","0.32","3.2","3.6","2.4"]
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