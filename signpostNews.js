


function renderNews(tagContainer,cSource,cTitle,cContent){
    let cHTML = `
        <div class="card mb-3 rounded shadow-lg" style="max-height:25rem">
            <div class="card-header bg-transparent border-success">      
                <div class="header-container">
                <div class="header-items">
                    <img class=" spIMG centered-element" src="https://www.brookfield.com/sites/default/files/styles/menu_feature/public/images/2022-12/brookfield-logo-nav-icon.png?h=79b747b9&itok=0jhwdxx-" alt="Girl in a jacket" height="20px">
                </div>
                <div class="header-items">
                    <div class="CenterContainer">${cSource}</div>
                </div>
                <div class="header-items">
                    <div class="CenterContainer">
                    <span class="material-symbols-outlined">delete</span>
                    </div>
                </div>
                </div>
            </div>
        
            <div class="card-body overflow-auto">
                <h5 class="card-title">${cTitle}</h5>
                <p class="card-text">${cContent}</p>
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
        </div>
    ` ;

    let tagMessageBox = document.createElement('div') ;
    tagContainer.appendChild(tagMessageBox) ;
    tagMessageBox.outerHTML = cHTML ;
}