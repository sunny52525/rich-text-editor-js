const buttons = document.querySelectorAll('button');
textField.document.designMode = "On"
let show = false
for (let i = 0; i < buttons.length; ++i) {
    buttons[i].addEventListener('click', () => {
        let cmd = buttons[i].getAttribute('data-cmd');
        if (buttons[i].name === "active") {
            buttons[i].classList.toggle('active')
        }

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
