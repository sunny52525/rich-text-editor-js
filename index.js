const myHTML = [
    '<div class="editor"> <form action="">' +
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
    addLink(url, cmd) {
        console.log(cmd)
        textField.document.execCommand(cmd, false, null)
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

    showHtml() {
        const text = textField.document.querySelector('body');
        if (this.show) {
            text.innerHTML = text.textContent
        } else {
            text.textContent = text.innerHTML
        }
        this.show = !this.show

    }

    otherCommands(command) {
        textField.document.execCommand(command, false, null)
    }

    saveHtml() {
        let textContent=textField.document.querySelector('body');
        const a = document.createElement('a');
        const file = new Blob([textContent.innerHTML], {type: 'html'});
        a.href= URL.createObjectURL(file);
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
        console.log(this.elements.buttons.length)
        let k = 0;
        this.elements.buttons[k].addEventListener('click', () => {
            console.log("oops")
        })
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

    }

    show() {
        console.log("show")
        this.elements.body.innerHTML = JSON.parse(JSON.stringify(myHTML))
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
    }

    createLink(cmd) {
        let url = window.prompt("Url?")
        if (url) {
            this._model.addLink(url, cmd)
        }
    }

    showCode() {
        this._model.showHtml()
    }

    otherActions(command) {
        this._model.otherCommands(command)
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
            'body': document.getElementsByTagName('body')[0]

        }),
        controller = new richController(view, model)
});