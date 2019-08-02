class TextField {
    constructor({ textField, button, hashTag, buttonsClassNames }) {
        this.textField = textField;
        this.button = button;
        this.hashTag = hashTag;
        this.buttonsClass = buttonsClassNames;
        this._count = 0;
        this._allHash = {};
        this._hashesForSearch = {};
        this._deleteHash = [];
        this._currentHash = {};
        this._hashes = [];

        document.addEventListener('click', (e) => {
            let target = e.target;

            if (target == button) {                                         //Create == Click
                if (this.checkField()) this.createTextField();

            } else if (target.closest(`.${buttonsClassNames.delete}`)) {    //Delete == Click 
                this.deleteButton(target);

            } else if (target.closest(`.${buttonsClassNames.edit}`)) {      //Edit == Button

                this.editButton(target);
            } else if (target.closest(`.${buttonsClassNames.save}`)) {      //Save == Button

                this.saveButton(target);
            } else if (target.closest(`.${buttonsClassNames.cancel}`)) {    //Cancel == Button

                this.cancelButton(target);
            } else if (target.closest('.hashTag')) {                        //DeleteHash == Button

                this._deleteHash.push(target.innerText);
                this._deleteHash[target.innerText]
                target.remove();
            }
        });

        textField.addEventListener('input', (e) => {
            this.makeHashInText(textField.value, e, hashTag);
            this.searchHash(textField.value);
            this.cleanHashes();
        });

    };

    createTextField() {
        let editButton = this.createElement('button', this.buttonsClass.edit, 'Edit');
        let deleteButton = this.createElement('button', this.buttonsClass.delete, 'Delete');
        let mainArticle = this.createElement('div', 'main-field');
        let textDiv = this.createElement('div', 'main-field-text', this.textField.value);
        let informationDiv = this.createElement('div', 'main-field-information');
        let tags = this.hashTag.cloneNode(true);

        this._hashes.push(tags);
        this.cleanHashes(true);
        this._count++;

        informationDiv.append(tags, editButton, deleteButton);
        mainArticle.append(textDiv, informationDiv);

        document.querySelector('section').append(mainArticle)

    };

    createElement(elem, className, text = false) {
        let div = document.createElement(elem);
        div.className = className;
        text ? div.innerText = text : null;

        return div;
    };

    checkField() {
        if (!this.textField.value) {
            console.log('Вы нечего не ввели');

            return false;
        };
        return true;
    };

    toggleButtons(target, button) {

        switch (button) {
            case 'Edit':
                target.innerText = 'Save';
                target.className = this.buttonsClass.save;

                target.nextElementSibling.innerText = 'Cancel';
                target.nextElementSibling.className = this.buttonsClass.cancel;
                break;

            case 'Delete':
                target.closest('.main-field').remove();
                break;

            case 'Save':
                target.innerText = 'Edit';
                target.className = this.buttonsClass.edit;

                target.nextElementSibling.innerText = 'Delete';
                target.nextElementSibling.className = this.buttonsClass.delete;
                break;

            case 'Cancel':
                target.innerText = 'Delete';
                target.className = this.buttonsClass.delete;

                target.previousElementSibling.innerText = 'Edit';
                target.previousElementSibling.className = this.buttonsClass.edit;
                break;

            default:
                break;
        }

    };

    deleteButton(target) {
        this.toggleButtons(target, 'Delete');
    };

    cancelButton(target) {
        let infAboutBlock = this.getBlockInformation(target);
        let div = this.createElement('div', 'main-field-text');
        div.innerText = this._currentText;

        this.toggleButtons(target, 'Cancel')
        this.styleBlock(div, infAboutBlock);

        infAboutBlock.textField.replaceWith(div);
    }

    editButton(target) {
        let infAboutBlock = this.getBlockInformation(target);
        let textarea = this.createElement('textarea', 'textarea-edit');
        this._currentText = infAboutBlock.text;

        this.toggleButtons(target, 'Edit')
        this.styleBlock(textarea, infAboutBlock);

        textarea.innerText = infAboutBlock.text;

        infAboutBlock.textField.replaceWith(textarea);

        textarea.focus();
        textarea.oninput = (e) => {
            textarea.style.height = `${textarea.scrollHeight}px`;
            this.makeHashInText(textarea.value, e, textarea.closest('.main-field').querySelector('p'));
        }
    };

    saveButton(target) {
        let infAboutBlock = this.getBlockInformation(target);
        let div = this.createElement('div', 'main-field-text');

        this.toggleButtons(target, 'Save');
        this.styleBlock(div, infAboutBlock);

        div.innerText = infAboutBlock.text;

        infAboutBlock.textField.replaceWith(div);
    };

    getBlockInformation(target) {
        let textField = target.closest('.main-field').firstElementChild;
        let text = textField.innerText ? textField.innerText : textField.value;

        return {
            textField,
            text
        }
    };

    styleBlock(target, styles) {
        target.style.cssText = `width: 100%;
                             height: ${styles.textField.offsetHeight}px`;
    };

    cleanHashes(clickButton) {
        if (clickButton || !this.textField.value) {
            let allTags = Array.from(this.hashTag.querySelectorAll('span'));
            let allMark = Array.from(document.querySelectorAll('.mark'))
            allMark.forEach(item => {
                let attr = item.dataset.text;
                console.log(attr)
                item.innerText = attr;
                item.classList.remove('mark');
            });
            allTags.forEach(item => item.hidden = true);
            this.textField.value = '';
            this._deleteHash = [];

        }

    };

    makeHashInText(text, e, forHash) {

        if (e.data == ' ' || e.inputType == "insertLineBreak") {
            var tags = this.checkHash(text);
        }

        if (tags) {
            forHash.innerText = '';

            tags.forEach(item => {
                if(~this._deleteHash.indexOf(item)) return;
                let elem = this.createElement('span', 'hashTag', item);
                forHash.append(elem)
            })
        }
    };

    checkHash(text) {
        let regExp = text.match(/#\w+\b/gi);

        if (regExp) {
            
            return [...regExp];
        }
    };

    searchHash(text) {
        let reg = text.match(/#\w+/i);

        if (reg) {
            for (let key in this._hashes) {
                let currentP = this._hashes[key];
                let allTags = Array.from(currentP.querySelectorAll('.hashTag'));

                allTags.forEach(item => {
                    let text = item.innerText;

                    if (~text.indexOf(reg)) {
                        console.log(item)
                        item.classList.add('mark');
                        item.setAttribute('data-text', text);
                        item.innerHTML = `<mark>${reg[0].slice(0, reg[0].length)}</mark>${text.slice(reg[0].length)}`;


                    }
                });


            }
        }
    }




}







let textField = new TextField({
    textField: document.querySelector('.main-inner_contents_form textarea'),
    button: document.querySelector('.main-inner_contents_form button'),
    hashTag: document.querySelector('.main-inner_contents_form_information p'),
    buttonsClassNames: {
        edit: 'main-field-edit',
        delete: 'main-field-delete',
        save: 'main-field-save',
        cancel: 'main-field-cancel'
    }
})

console.log(textField)



