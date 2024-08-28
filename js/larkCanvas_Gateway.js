


function renderBookMark(jsonBookMark){
    console.log(`will render ${JSON.stringify(jsonBookMark,null,3)}`) ;
    let tagBookMark =document.createElement('li') ;
    tagBookMark.innerHTML = `
        <div class="boxBookmark">
            <div>
                <img tabindex="-1" class="image-LAVC" data-ar="7:6" width="56" height="48" alt=" " src="https://rdl.ink/render/https%3A%2F%2Fwww.w3schools.com%2Fimages%2Fw3schools_logo_436_2.png?mode=crop&amp;fill=solid&amp;width=56&amp;ar=7:6&amp;dpr=1.7999999523162842" draggable="false">                            
            </div>

            <div class="boxBookmarkMeta">
                <span>${jsonBookMark.title}</span>
                <div>${jsonBookMark.data.url}</div>
            </div>
            <div class="boxToolbar toolVisibilty">
                <i class="bi-google"></i>
                <i class="bi-trash-fill"></i>
                <i class="bi-pencil-square"></i>
            </div>
        </div>
        
    ` ;

    tagBookMark.classList.add('larkDraggable') ;
    tagBookMark.setAttribute('draggable', true);

    tagBookMark.dataset.larkID = jsonBookMark.id ;
    tagBookMark.dataset.url = jsonBookMark.data.url ;

    tagBookMark.querySelector('.boxBookmarkMeta').addEventListener('click',(event)=>{
        window.open(tagBookMark.dataset.url, '_blank').focus();
    }) ;

    tagBookMark.querySelector('.bi-google').addEventListener('click',(event)=>{
        window.open(tagBookMark.dataset.url, '_blank').focus();
    }) ;

    tagBookMark.querySelector('.bi-trash-fill').addEventListener('click',(event)=>{
        let tagBookmark = event.target.closest('li') ;
        tagBookmark.remove() ;
        event.preventDefault() ;
    }) ;
    tagBookMark.querySelector('.bi-pencil-square').addEventListener('click',(event)=>{
        alert('bi-pencil-square')
        event.preventDefault() ;
    }) ;

    
    tagBookMark.addEventListener('dragstart', function(event) {
        globalDraggedItem = event.target;
        setTimeout(() => {
            event.target.style.display = 'none';
        }, 0);
    });

    // When dragging over other items
    tagBookMark.addEventListener('dragover', function(e) {
        e.preventDefault(); // Prevent default to allow drop
    });

    // When the dragging enters a new list item
    tagBookMark.addEventListener('dragenter', function(e) {
        e.preventDefault();
        tagBookMark.style.borderTop = '2px solid #3498db';
    });

    // When dragging leaves a list item
    tagBookMark.addEventListener('dragleave', function() {
        tagBookMark.style.borderTop = '';
    });

    return tagBookMark ;
}
