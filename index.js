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


myHTML.forEach(() => {
    document.getElementsByTagName('body')[0].innerHTML = JSON.parse(JSON.stringify(myHTML))
})

const buttons = document.querySelectorAll('button');
textField.document.designMode = "On"
let show = false
for (let i = 0; i < buttons.length; ++i) {
    buttons[i].addEventListener('click', () => {
        let cmd = buttons[i].getAttribute('data-cmd');
        // if (buttons[i].name === "active") {
            buttons[i].classList.toggle('active')
        // }

        if (cmd === "createLink") {
            let url = prompt("Url?")
            textField.document.execCommand(cmd, false, url)
            const links = textField.document.querySelectorAll('a')
            links.forEach(link => {
                link.addEventListener('mouseover', () => {
                    textField.document.designMode = "Off"
                })
                link.addEventListener('mouseout', () => {
                    textField.document.designMode = "On"
                })
                link.target = "_blank";
            })
        } else {
            textField.document.execCommand(cmd, false, null)
        }

        if (cmd === "showCode") {
            const text = textField.document.querySelector('body');
            if (show) {
                text.innerHTML = text.textContent
            } else {
                text.textContent = text.innerHTML
            }
            show = !show
        }
    })
}

document.getElementById('save').addEventListener('click',()=>{
    let textContent=textField.document.querySelector('body');
    console.log(textContent.innerHTML)

    downloadToFile(textContent.innerHTML,"test.html","html")
})
const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});

    a.href= URL.createObjectURL(file);
    a.download = filename;
    a.click();

    URL.revokeObjectURL(a.href);
};

