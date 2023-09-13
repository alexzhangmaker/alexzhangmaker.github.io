

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
    tagMessageBox.outerHTML = cHTML ;
}