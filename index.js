const myHTML = [
    '<div class="editor" id="editor"> <form action="">' +
    ' <button type="button" data-cmd="justifyRight"><i class="fas fa-align-right"></i></button> ' +
    '<button type="button" data-cmd="justifyLeft"><i class="fas fa-align-left"></i></button>' +
    ' <button type="button" data-cmd="justifyCenter"><i class="fas fa-align-center"></i></button>  ' +
    '<button type="button" data-cmd="justifyFull"><i class="fas fa-align-justify"></i></button> ' +
    '<button type="button" data-cmd="bold"><i class="fas fa-bold"></i></button>' +
    '<button type="button" data-cmd="italic"><i class="fas fa-italic"></i></button>' +
    '<button type="button" data-cmd="underline"><i class="fas fa-underline"></i></button> ' +
    '<button type="button" data-cmd="insertUnorderedList"><i class="fas fa-list-ul"></i></button>' +
    '<button type="button" data-cmd="insertOrderedList"><i class="fas fa-list-ol"></i></button>' +
    '<button type="button" data-cmd="createLink"><i class="fas fa-link"></i></button>' +
    '<button type="button" data-cmd="showCode" name="active"><i class="fas fa-code"></i></button>' +
    '<button type="button" data-cmd="redo" name="active"><i class="fas fa-redo"></i></button> ' +
    '<button type="button" data-cmd="undo" name="active"><i class="fas fa-undo"></i></button> ' +
    '</form> ' +
    '<div id="textOut" contenteditable="true"   name="textField"></div> ' +
    '</div>' +
    '<button id="save">Save</button>'
]
const snippets = [

    {
        prefix: "for",
        body: ["for (let i = 0; i < size; i++) { \n }  \n "]
    },
    {
        prefix: "foreach",
        "body": [
            "array.forEach(element => { \n});\n "
        ]
    },
    {

        "prefix": "function",
        "body": [
            "function name (params)\n {\n }\n "
        ]
    },
    {
        "prefix": "if",
        "body": [
            "if (condition) {\n }\n "
        ],
    },
    {
        "prefix": "log",
        "body": [
            "console.log();"
        ],
    }
];


class EventEmitter {
    constructor() {
        this._events = {};
    }

    on(evt, listener) {
        (this._events[evt] || (this._events[evt] = [])).push(listener);
        return this;
    }

    emit(evt, arg) {
        (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
    }
}

class richTextModel extends EventEmitter {

    constructor(show) {
        super();
        this.show = show

    }

    saveHtml() {
        let textContent = textField.document.querySelector('body');
        const a = document.createElement('a');
        const file = new Blob([textContent.innerHTML], {type: 'html'});
        a.href = URL.createObjectURL(file);
        a.download = 'test.txt';
        a.click();
        URL.revokeObjectURL(a.href);
    }

}

class richTextView extends EventEmitter {
    constructor(model, elements) {
        super();
        this.model = model
        this.elements = elements
        console.log(this.elements)


        this.elements.buttons.forEach((item) => {
            item.addEventListener('click', () => {
                let cmd = item.getAttribute('data-cmd');
                console.log(cmd)
                if (cmd === "createLink") {

                    this.emit("createLink", cmd)
                } else {
                    this.emit("other", cmd)
                    // console.log(cmd)

                }
                if (cmd === "showCode") {
                    this.emit("showCode")
                }
            })
        })


        this.elements.saveButton.addEventListener('click', () => {
            this.emit("save")
        })


        document.addEventListener('keydown', (evt) => {
            console.log("what" + evt.keyCode)
            if (evt.keyCode === 9) {
                evt.preventDefault()
                // console.log( this.elements.textField)
                this.emit("complete", this.elements.textField)
            }
        })
    }

    showCode() {
        const text = document.getElementById('textOut')

        if (this.show) {
            text.innerHTML = text.textContent
        } else {
            text.textContent = text.innerHTML
        }
        this.show = !this.show
    }

    createLink(cmd, url) {
        const sText = document.getSelection();
        document.execCommand('insertHTML', false, '<a href="' + url + '" target="_blank">' + sText + '</a>');
    }

    otherActions(command) {
        document.execCommand(command, false, null)

    }

    changeContent(editor) {
        editor.textContent = editor.value
    }

    checkSuggestion(keyword, editor) {
        keyword=this.removeSpecialCharacters(keyword.trim());
        if (this._isContains(snippets,keyword )){
            // console.log(snippets)
            for (let i = 0; i < snippets.length; ++i) {

                const obj = snippets[i];
                // console.log(obj.prefix+" "+keyword)

                if (obj.prefix === keyword.trim()) {
                    // console.log(editor.innerText.substring(0, editor.innerText.length - keyword.length))
                    const text = obj.body.toString().substring(keyword.length, obj.body.toString().length - 1);
                    let sel, range;
                    if (window.getSelection) {
                        sel = window.getSelection();
                        if (sel.getRangeAt && sel.rangeCount) {
                            range = sel.getRangeAt(0);
                            range.deleteContents();
                            range.insertNode(document.createTextNode(text));
                        }
                    } else if (document.selection && document.selection.createRange) {
                        document.selection.createRange().text = text;
                    }
                }
            }
        } else {
            console.log("Nope")
        }
    }


    removeSpecialCharacters(keyword){
        console.log(keyword)
        const desired = keyword.replace(/[^\w\s]/gi, '');
        console.log(desired.trim())
        return desired
    }
    _isContains(json, value) {

        let contains = false;
        Object.keys(json).some(key => {
            contains = typeof json[key] === 'object' ? this._isContains(json[key], value.trim()) : json[key] === value.trim();
            return contains;
        });
        return contains;
    }
}

class richController {

    constructor(view, model) {
        this._model = model
        this._view = view
        view.on("createLink", cmd => this.createLink(cmd))
        view.on("showCode", () => this.showCode())
        view.on("other", command => this.otherActions(command))
        view.on("save", () => this.saveHtml())
        view.on("editing", (editor) => this.changeContent(editor))
        view.on("complete", (editor) => this.complete(editor))
    }

    changeContent(editor) {

        this._view.changeContent(editor)
    }


    complete(editor) {
        let val = editor.innerText.trim()
        const input = val.split(" ");
        // console.log(input)

        this._view.checkSuggestion(input[input.length - 1], editor);
    }

    createLink(cmd) {
        // console.log("h")
        let url = window.prompt("Url?")
        if (url) {
            // console.log(cmd)
            this._view.createLink(cmd, url)
        }
    }

    showCode() {
        this._view.showCode()

    }

    otherActions(command) {
        this._view.otherActions(command)
    }

    saveHtml() {
        this._model.saveHtml()
    }
}

window.addEventListener('load', () => {

    myHTML.forEach(() => {
        document.getElementsByTagName('body')[0].innerHTML = JSON.parse(JSON.stringify(myHTML))
    })

    const model = new richTextModel(false),
        view = new richTextView(model, {
            'buttons': document.querySelectorAll('button'),
            'saveButton': document.getElementById('save'),
            'body': document.getElementsByTagName('body')[0],
            'editor': document.getElementById('editor'),
            'document': document,
            'textField': document.getElementById('textOut')

        }),
        controller = new richController(view, model)

});


