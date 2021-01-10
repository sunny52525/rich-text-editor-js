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
    '<iframe id="textOut"  name="textField"></iframe> ' +
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


        textField.document.designMode = "On"
        this.elements.buttons.forEach((item) => {
            item.addEventListener('click', () => {
                let cmd = item.getAttribute('data-cmd');
                if (cmd === "createLink") {
                    this.emit("createLink", cmd)
                } else {
                    this.emit("other", cmd)
                }
                if (cmd === "showCode") {
                    this.emit("showCode")
                }
            })
        })


        this.elements.saveButton.addEventListener('click', () => {
            this.emit("save")
        })


        this.elements.editor.addEventListener('keyup', () => {
            console.log("asd")
            this.emit("editing", this.elements.editor)
        })

       document.addEventListener('keydown', (evt) => {
            console.log("what"+evt.keyCode  )
            if (evt.keyCode === 9) {
                evt.preventDefault()
                this.emit("complete", this.elements.editor)
            }
        })
    }

    showCode() {
        const text = textField.document.querySelector('body');
        if (this.show) {
            text.innerHTML = text.textContent
        } else {
            text.textContent = text.innerHTML
        }
        this.show = !this.show
    }

    createLink(cmd, url) {
        textField.document.execCommand(cmd, false, url)
        const links = textField.document.querySelectorAll('a')
        links.forEach(link => {
            link.addEventListener('mouseover', () => {
                textField.document.designMode = "Off"
            })
            link.addEventListener('mouseout', () => {
                textField.document.designMode = "On";
            })
            link.target = "_blank";
        })
    }

    otherActions(command) {
        textField.document.execCommand(command, false, null)

    }

    changeContent(editor) {
        editor.textContent=editor.value
    }

    checkSuggestion(keyword,editor){
        if (this._isContains(snippets, keyword)) {
            for (let i = 0; i < snippets.length; ++i) {
                const obj = snippets[i];
                // console.log(obj)
                if (obj.prefix === keyword) {
                    console.log(editor.value.substring(0, editor.value.length - keyword.length))
                    editor.setRangeText(obj.body.toString().substring(keyword.length, obj.body.toString().length - 1), editor.selectionStart, editor.selectionEnd, "end");
                }
            }
        } else {
            console.log("Nope")
        }
    }

    _isContains(json, value) {
        // console.log(value +"val")
        let contains = false;
        Object.keys(json).some(key => {
            contains = typeof json[key] === 'object' ? _isContains(json[key], value) : json[key] === value;
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
        let val = editor.value.trim()
        const input = val.split(" ");
        console.log(input)
        this._view.checkSuggestion(input[input.length - 1],editor);
    }

    createLink(cmd) {
        let url = window.prompt("Url?")
        if (url) {
            console.log(cmd)
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
            'document':document

        }),
        controller = new richController(view, model)

});