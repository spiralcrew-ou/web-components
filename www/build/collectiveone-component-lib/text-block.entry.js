const h = window.CollectiveoneComponentLib.h;

class TextBlock {
    constructor() {
        // Keep timeout to cancel debounce typing
        this.changeTextTimeout = null;
    }
    componentDidLoad() {
        const element = this.element.shadowRoot.getElementById(this.id);
        if (element)
            element.focus();
    }
    componentWillUpdate() {
        const element = this.element.shadowRoot.getElementById(this.id);
        if (element)
            element.innerHTML = this.text;
    }
    render() {
        return (h("div", null,
            h("span", { id: this.id, class: 'text-block', "data-placeholder": 'Start typing...', contenteditable: 'true' }, this.text)));
    }
    onKeyDown(event) {
        if (event.key !== 'Enter') {
            event.stopPropagation();
            // Debounce to not save every key down but every two seconds of change
            if (this.changeTextTimeout) {
                clearTimeout(this.changeTextTimeout);
            }
            this.changeTextTimeout = setTimeout(() => {
                // Get the new text and emit it
                const newText = this.element.shadowRoot.getElementById(this.id)
                    .innerText;
                this.contentChanged.emit(newText);
            }, 2000);
        }
    }
    static get is() { return "text-block"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "element": {
            "elementRef": true
        },
        "id": {
            "type": String,
            "attr": "id"
        },
        "text": {
            "type": String,
            "attr": "text"
        }
    }; }
    static get events() { return [{
            "name": "content-changed",
            "method": "contentChanged",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }]; }
    static get listeners() { return [{
            "name": "keydown",
            "method": "onKeyDown"
        }]; }
    static get style() { return "[contenteditable=true]:empty:before {\n  content: attr(data-placeholder);\n  opacity: 0.7; }\n\n[contenteditable] {\n  display: block;\n  /* For Firefox */\n  font-family: \"Open Sans\", sans-serif;\n  font-size: 22px; }\n\n[contenteditable=true]:focus {\n  outline: 0px solid transparent; }"; }
}

export { TextBlock };
