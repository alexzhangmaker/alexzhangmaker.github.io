

function renderMessage(tagContainer,cContent,cSource){
    let cHTML = `
        <div class="row">
                <div class="col-lg-6 mx-auto">
                    <blockquote class="blockquote blockquote-custom bg-white p-5 shadow rounded">
                        <div class="blockquote-custom-icon bg-info shadow-sm"><i class="bx bxl-dribbble"></i></div>
                        <p class="mb-0 mt-2 font-italic">${cContent}</p>
                        <footer class="blockquote-footer pt-4 mt-4 border-top">
                        ${cSource}
                        </footer>
                    </blockquote>
                </div>
        </div>
    ` ;

    let tagMessageBox = document.createElement('div') ;
    tagContainer.appendChild(tagMessageBox) ;
    tagMessageBox.classList.add("m-4") ;
    tagMessageBox.style.fontFamily = "'Roboto',sans-serif;" ;
    tagMessageBox.outerHTML = cHTML ;

    applyMessageCSS() ;
}


function applyMessageCSS(){
    const tagCSSStyle = document.createElement('style');
    tagCSSStyle.type = 'text/css';

    tagCSSStyle.textContent = `
        .blockquote-custom {
            position: relative;
            font-size: 1.1rem;
        }
        
        .blockquote-custom-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: -25px;
            left: 50px;
        }
    `;

    document.head.appendChild(tagCSSStyle);

}