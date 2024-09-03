let globalDraggedItem = null;


function enbaleDragNDrop(cssContainer){
    // Select the list and all list items
    const items = document.querySelectorAll(cssContainer);

    for(let i=0;i<items.length;i++){
        let item = items[i] ;
        item.addEventListener('dragstart', function(event) {
            globalDraggedItem = event.target;
            setTimeout(() => {
                event.target.style.display = 'none';
            }, 0);
        });

        // When dragging over other items
        item.addEventListener('dragover', function(e) {
            e.preventDefault(); // Prevent default to allow drop
        });

        // When the dragging enters a new list item
        item.addEventListener('dragenter', function(e) {
            e.preventDefault();
            item.style.borderTop = '2px solid #3498db';
        });

        // When dragging leaves a list item
        item.addEventListener('dragleave', function() {
            item.style.borderTop = '';
        });

        // When the item is dropped
        item.addEventListener('drop', function(event) {
            //let ddItem = event.target ;
            event.target.style.borderTop = '';
            if(globalDraggedItem==null){
                console.log('null globalDraggedItem');
                return ;
            }
            if (globalDraggedItem !== this) {
                //list.insertBefore(globalDraggedItem, this);
                /*
                let parentNode = event.target.parentNode ;
                if(parentNode.classList.contains('larkDroppable')){
                    parentNode.insertBefore(globalDraggedItem, this);
                    //globalDraggedItem.style.display = 'block';
                    //globalDraggedItem = null ;
                }
                */
                if(event.target.classList.contains('larkDroppable')){
                    event.target.insertBefore(globalDraggedItem, this);
                }else{
                    let ancestorDrappable = event.target.closest('.larkDroppable') ;
                    if(ancestorDrappable!=null){
                        ancestorDrappable.insertBefore(globalDraggedItem, this);
                    }
                }
                
            }
        });

        // When the drag ends
        item.addEventListener('dragend', function() {
            setTimeout(() => {
                globalDraggedItem.style.display = 'block';
                globalDraggedItem = null;
            }, 0);
        });
    }
}