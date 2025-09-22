/**
 * 创建一个通用的表单模态框
 * @param {string} title 模态框的标题
 * @param {Array<Object>} schema 定义表单结构的数组
 * @param {Object} callbacks 包含 onConfirm 和 onCancel 回调函数的对象
 */
/*
// 1. 定义你的表单结构 (Schema)
const mySchema = [
    { "name": "key", "type": "string", "placeholder": "请输入唯一的Key" },
    { "name": "Words", "type": "array", "placeholder": "输入词语，用英文逗号,分隔" },
    { "name": "大类title", "type": "string" },
    { "name": "分类title", "type": "textarea", "placeholder": "请输入详细描述信息" },
    { "name": "级别", "type": "number", "placeholder": "请输入数字级别" },
    { "name": "是否发布", "type": "boolean" }
];

// 2. 定义回调函数
const myCallbacks = {
    onConfirm: (formData) => {
        console.log("表单已确认, 接收到的数据:", formData);
        alert("数据已提交，请查看控制台！");
    },
    onCancel: () => {
        console.log("用户取消了操作。");
    }
};

// 3. 调用函数创建并显示 Modal
createFormModal('新建项目', mySchema, myCallbacks);
*/

function createFormModal(title, schema, callbacks) {
    // --- 1. 防止重复创建，先移除已存在的 modal ---
    const existingModal = document.getElementById('generic-modal-backdrop');
    if (existingModal) {
        existingModal.remove();
    }

    // --- 2. 创建 CSS 样式 ---
    // 为了让组件自包含，我们动态创建 style 标签
    const styleId = 'generic-modal-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .modal-content {
                background-color: white;
                padding: 25px;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 500px;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .modal-backdrop.visible {
                opacity: 1;
            }
            .modal-backdrop.visible .modal-content {
                transform: scale(1);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
                margin-bottom: 20px;
            }
            .modal-header h2 {
                margin: 0;
                font-size: 1.25rem;
            }
            .modal-close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #888;
            }
            .modal-form .form-group {
                margin-bottom: 15px;
            }
            .modal-form .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #333;
            }
            .modal-form .form-group input[type="text"],
            .modal-form .form-group input[type="number"],
            .modal-form .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-sizing: border-box; /* 保证 padding 不会影响宽度 */
            }
            .modal-form .form-group .checkbox-group {
                display: flex;
                align-items: center;
            }
             .modal-form .form-group .checkbox-group input {
                margin-right: 10px;
            }
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 25px;
            }
            .modal-footer button {
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
            }
            .modal-btn-confirm {
                background-color: #007bff;
                color: white;
            }
            .modal-btn-cancel {
                background-color: #f1f1f1;
                color: #333;
            }
        `;
        document.head.appendChild(style);
    }

    // --- 3. 创建 Modal 的 DOM 结构 ---
    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.id = 'generic-modal-backdrop';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `<h2>${title}</h2>`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.innerHTML = '&times;';
    modalHeader.appendChild(closeBtn);

    // Body (Form)
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    const form = document.createElement('form');
    form.className = 'modal-form';

    // 根据 Schema 生成表单项
    schema.forEach(field => {
        const group = document.createElement('div');
        group.className = 'form-group';

        const label = document.createElement('label');
        label.setAttribute('for', field.name);
        label.textContent = field.name;
        group.appendChild(label);

        let input;
        switch (field.type) {
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                break;
            case 'array':
            case 'textarea': // textarea 可以复用 array 的输入形式
                input = document.createElement('textarea');
                input.rows = 3;
                break;
            case 'boolean':
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.className = 'checkbox-group';
                input = document.createElement('input');
                input.type = 'checkbox';
                // 对于 checkbox，把 label 放在右边更符合习惯
                checkboxWrapper.appendChild(input);
                checkboxWrapper.appendChild(label); 
                group.innerHTML = ''; // 清空 group，因为 label 已经放入 wrapper
                group.appendChild(checkboxWrapper);
                break;
            case 'string':
            default:
                input = document.createElement('input');
                input.type = 'text';
                break;
        }

        if (field.type !== 'boolean') {
             input.id = field.name;
             input.name = field.name;
             if(field.placeholder) {
                input.placeholder = field.placeholder;
             }
             group.appendChild(input);
        } else {
             input.id = field.name;
             input.name = field.name;
        }

        form.appendChild(group);
    });

    modalBody.appendChild(form);

    // Footer (Buttons)
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'modal-btn-confirm';
    confirmBtn.textContent = '确认';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn-cancel';
    cancelBtn.textContent = '取消';
    modalFooter.appendChild(cancelBtn);
    modalFooter.appendChild(confirmBtn);

    // 组装 Modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modalBackdrop.appendChild(modalContent);

    // --- 4. 挂载到 Body ---
    document.body.appendChild(modalBackdrop);
    
    // 触发显示动画
    setTimeout(() => {
        modalBackdrop.classList.add('visible');
    }, 10);


    // --- 5. 事件处理 ---
    const closeModal = () => {
        modalBackdrop.classList.remove('visible');
        modalBackdrop.addEventListener('transitionend', () => {
            modalBackdrop.remove();
        }, { once: true });
    };

    // 点击确认按钮
    confirmBtn.addEventListener('click', () => {
        const formData = {};
        schema.forEach(field => {
            const inputElement = form.elements[field.name];
            if (inputElement) {
                switch (field.type) {
                    case 'number':
                        formData[field.name] = parseFloat(inputElement.value) || 0;
                        break;
                    case 'array':
                        // 将逗号分隔的字符串转为数组，并去除首尾空格
                        formData[field.name] = inputElement.value ? inputElement.value.split(',').map(item => item.trim()) : [];
                        break;
                    case 'boolean':
                        formData[field.name] = inputElement.checked;
                        break;
                    default:
                        formData[field.name] = inputElement.value;
                        break;
                }
            }
        });

        // 调用成功回调
        if (callbacks && typeof callbacks.onConfirm === 'function') {
            callbacks.onConfirm(formData);
        }
        closeModal();
    });
    
    // 监听表单的 submit 事件，防止页面刷新，并触发确认按钮的点击
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        confirmBtn.click();
    });

    // 点击取消按钮
    cancelBtn.addEventListener('click', () => {
        // 调用取消回调
        if (callbacks && typeof callbacks.onCancel === 'function') {
            callbacks.onCancel();
        }
        closeModal();
    });

    // 点击关闭按钮
    closeBtn.addEventListener('click', () => {
        cancelBtn.click();
    });

    // 点击背景遮罩层关闭
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            cancelBtn.click();
        }
    });
}