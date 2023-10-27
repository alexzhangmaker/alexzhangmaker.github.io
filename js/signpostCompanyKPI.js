

let jsonBrookfield={
    "Company":{
        "ticker":"BX",
        "Company":"Brookfield",
        "logo":""
    },
    "KPIs":[
        {
            "KPI":"Price",
            "Value":32.43
        },{
            "KPI":"PE Ratio",
            "Value":12.34
        },{
            "KPI":"Earning",
            "Value":12.3
        },{
            "KPI":"DE",
            "Value":12.43
        },{
            "KPI":"FRE",
            "Value":22.43
        },{
            "KPI":"Dividend",
            "Value":0.43
        },{
            "KPI":"Yield",
            "Value":0.045
        }
    ]
} ;


function renderCompanyKPI(tagContainer, jsonCompanyKPI){
    let tagCompanyKPI = document.createElement('div') ;
    tagContainer.appendChild(tagCompanyKPI) ;
    //tagCompanyKPI.classList.add("m-4") ;
    //tagCompanyKPI.style.fontFamily = "'Roboto',sans-serif;" ;


    let cHTML = `
      <div class="card mb-3 rounded shadow-lg">
        <div class="card-header bg-transparent border-success"><h5>Brookfield Renewable Partner</h5></div>
        
        <div class="card-body overflow-auto">
          <div class="container-lg">
            <div class="row border">
  
                <div class="col-xl-2 col-md-2 col-xxl-2 border">
                  <div class="container-lg border classLogoContainer">
                    <p>Box 1</p>
                  </div>
                </div>
              
                <div class="col-xl-10 col-md-10 col-xxl-10">
                  <div class="container-lg">
                    <div class="row border classKPIContainer">
                          
                    </div>
                  </div>
                </div>
                
            </div>
          </div>
        </div>
  
        <div class="card-footer bg-transparent border-success"></div>
      </div>
    ` ;
    tagCompanyKPI.outerHTML = cHTML ;

    let tagLogoContainer = document.querySelector(".classLogoContainer") ;
    renderLogo(tagLogoContainer,jsonBrookfield.Company) ;

    let tagKPIContainer = document.querySelector(".classKPIContainer") ;
    for(let i=0;i<jsonBrookfield.KPIs.length;i++){
        renderKPI(tagKPIContainer,jsonBrookfield.KPIs[i]) ;
    }

    applyCompanyKPICSS() ;

}


function renderKPI(tagKPIContainer,jsonKPI){
    let cHTML = `
        <div class="col-xl-4 col-md-6 col-xxl-3 border">
            <ul class="KPIul">
            <li class="box-green">${jsonKPI.KPI}</li>
            <li class="box-red liKPI">${jsonKPI.Value}</li>
            </ul> 
        </div>
    ` ;

    let tagKPI = document.createElement('div') ;
    tagKPIContainer.appendChild(tagKPI) ;
    tagKPI.outerHTML = cHTML ;

}

function renderLogo(tagLogoContainer,jsonLogo){

}

function applyCompanyKPICSS(){
    const tagCSSStyle = document.createElement('style');
    tagCSSStyle.type = 'text/css';

    tagCSSStyle.textContent = `
        .KPI_UL-container {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: flex-end;
            align-items: stretch;
            align-content: normal;
        }
        
        .KPIul {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 0;
            margin: 0;
            list-style: none;
            
            display: block;
            flex-grow: 0;
            flex-shrink: 1;
            flex-basis: auto;
            align-self: auto;
            order: 0;
        
        }
        
        
        .liKPI{
            font-size:1.5rem ;
        }
    `;

    document.head.appendChild(tagCSSStyle);

}