 class ContextMenus {
    maxWidth = 0;
    maxHeight = 0;
    // 设定子元素偏移值，防止子菜单异常消失
    marginX = 3;
    getOffset = {
        top: function topOffset(obj) {
            return obj.offsetTop + (obj.offsetParent ? topOffset(obj.offsetParent) : 0);
        },
        left: function leftOffset(obj) {
            return obj.offsetLeft + (obj.offsetParent ? leftOffset(obj.offsetParent) : 0);
        }
    };
    callback = (...args) => {}
    events = []
    constructor(opt = {...args}) {
        if (!opt.className || !opt.menu) {
            throw new Error("className || menu is not empty");
        }
        // 容器
        this.container = document.querySelector(opt.className)
        this.container.oncontextmenu = this._oncontextmenu.bind(this)
        this.container.onclick = this._onclick.bind(this)
        this.menu = opt.menu
        this._render()
        this.right_menu_box = this.container.querySelector('.contextmenu')
        this.allLi = this.container.getElementsByTagName('li')
        this._bindLiEvent()
    }

    _bindLiEvent()  {
        var aLi = this.allLi
        const this_ = this
        for (let i = 0; i < aLi.length; i++) {
            aLi[i].onmouseenter = function () {
                var oThis = this
                var oThisRect = oThis.getBoundingClientRect();
                // 获取子菜单，如果有的话
                var oUl = oThis.getElementsByTagName("ul");
                // 显示子菜单
                if (oUl[0]) {
                    for (i = 0; i < oThis.parentNode.children.length; i++){
                        oThis.parentNode.children[i].getElementsByTagName("ul")[0] &&
                        (oThis.parentNode.children[i].getElementsByTagName("ul")[0].style.display = "none");
                    }
                    oUl[0].style.display = "block";
                    oUl[0].style.top = `0px`;
                    oUl[0].style.left = `${oThis.offsetWidth - this_.marginX}px`;
                    
                    const CRect = this_.container.getBoundingClientRect()
        
                    // 最大显示范围
                    this_.maxWidth = CRect.width - oUl[0].offsetWidth;
                    this_.maxHeight = CRect.height - oUl[0].offsetHeight;
        
                    // 防止溢出
                    this_.maxWidth < this_.getOffset.left(oUl[0])&&(oUl[0].style.left = -oUl[0].clientWidth + "px");
                    this_.maxHeight < this_.getOffset.top(oUl[0])&&(oUl[0].style.top = -oUl[0].clientHeight + oThisRect.height + "px")
                }  
            }
        
            // 鼠标移除
            aLi[i].onmouseleave = function () {
                var oThis = this;
                // 获取子菜单，如果有的话
                var oUl = oThis.getElementsByTagName("ul");
                if (oUl[0]) {
                    oUl[0].style.position = 'absolute'
                    oUl[0].style.left = `0px`
                    oUl[0].style.display = 'none'
                }
            }
        }
    }

    _onclick (evt) {
        this.right_menu_box.style.display = 'none'
    }

    _oncontextmenu (evt) {
        evt.preventDefault()
        const containerRect = this.container.getBoundingClientRect()
        const scrollOffsetX = this.container.scrollLeft;
        const scrollOffsetY = this.container.scrollTop;
        this.right_menu_box.style.display = 'block'
        const menuRect = this.right_menu_box.getBoundingClientRect()

        // 容器具有滚动条，需要加上滚动条x,y，避免坐标不准确
        let menuTop = evt.clientY + scrollOffsetY;
        let menuLeft = evt.clientX + scrollOffsetX;

        // 最大显示范围
        this.maxWidth = Math.round(containerRect.width - menuRect.width);
        this.maxHeight = Math.round(containerRect.height - menuRect.height);

        // 防止菜单溢出
        menuTop > this.maxHeight && (menuTop = this.maxHeight);
        menuLeft > this.maxWidth && (menuLeft = this.maxWidth);

        // 解决滚动内容后右键菜单显示在底部问题
        if (evt.clientY+menuRect.height < containerRect.height) {
            menuTop = evt.clientY;
        }
        if (menuTop < this.maxHeight) {
            menuTop = evt.clientY;
        }

        // 更新菜单坐标
        this.right_menu_box.style.top = menuTop + "px";
        this.right_menu_box.style.left = menuLeft + "px";
    }

    _render () {
        this.events = []
        this.recursionRender(this.menu)
    }

    recursionRender (data_ = [], parent = null) {
        const UL = document.createElement('ul')
        UL.classList.add('contextmenu')
        parent&&this.setParentInner(parent)

        for (let i = 0; i < data_.length; i++) {
            const item = data_[i]
            const LI = document.createElement('li')
            LI.innerText = item.title

            if (item.action) {
                LI.setAttribute('data-action', item.action)
            }

            if (parent) {
                UL.appendChild(LI)
                parent.appendChild(UL)
            } else {
                LI.onclick = this._bindLiClick.bind(this)
                UL.appendChild(LI)
            }

            if (item.children && item.children.length) {
                this.recursionRender(item.children, LI)
            }
        }

        !parent&&this.container.appendChild(UL)
    }

    _bindLiClick (evt) {
        const childrens = Array.from(evt.target.getElementsByTagName('ul'))
        if (childrens && childrens.length === 0) {
            const Key_ = evt.target.getAttribute('data-action')
            this.callback({ action: Key_, title: evt.target.innerText }, evt)
        }
    }

    on (callback) {
       this.callback = callback
    }

    getEventKey () {
        return this.events;
    }

    setParentInner (parent) {
        const span = document.createElement('span')
        span.innerText = parent.innerText
        const span1 = document.createElement('span')
        span1.innerHTML = '&gt;'
        parent.innerText = ""
        parent.appendChild(span)
        parent.appendChild(span1)
    }

    destroy() {
        this.allLi = []
        this.events = []
        this.container = null
        this.menu = []
        this.right_menu_box = null
    }
}