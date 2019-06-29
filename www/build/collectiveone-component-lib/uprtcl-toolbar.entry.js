const h = window.CollectiveoneComponentLib.h;

import { u as uprtclMultiplatform, v as uprtclData } from './chunk-c7d81f94.js';
import './chunk-84ac4f31.js';

class UptrclToolbar {
    constructor() {
        this.creatingPerspective = false;
        this.contextPerspectives = [];
        this.uprtcl = uprtclMultiplatform;
    }
    async componentWillLoad() {
        this.contextPerspectives = await this.uprtcl.getContextPerspectives(this.perspective.contextId);
    }
    async logUprtcl() {
        const perspectiveFull = await uprtclData.getPerspectiveFull(this.perspective.id, 5);
        console.log(perspectiveFull);
    }
    componentDidLoad() {
    }
    render() {
        return (h("div", { class: "flex-column" },
            h("div", { class: "flex-row" },
                h("select", { disabled: this.contextPerspectives.length === 0, onChange: (e) => {
                        this.selectPerspective.emit(e.target.selectedOptions[0].value);
                    } }, this.contextPerspectives.length === 0 ? (h("option", null, "Loading...")) : (this.contextPerspectives.map(perspective => (h("option", { value: perspective.id }, perspective.name))))),
                h("button", { onClick: () => (this.creatingPerspective = true) }, "New Perspective"),
                h("button", { onClick: () => this.createCommit.emit() }, "Commit"),
                h("button", { onClick: () => this.logUprtcl() }, "Log")),
            this.creatingPerspective ? (h("div", { class: "flex-row" },
                h("select", { id: "new-perspective-provider" }, this.uprtcl.getServiceProviders().map(service => (h("option", { value: service }, service)))),
                h("input", { id: "new-perspective-name", type: "text" }),
                h("button", { onClick: () => this.createPerspective() }, "Create"))) : ('')));
    }
    createPerspective() {
        const name = this.element.shadowRoot.getElementById('new-perspective-name');
        const provider = this.element.shadowRoot.getElementById('new-perspective-provider');
        this.createPerspectiveEvent.emit({
            name: name['value'],
            serviceProvider: provider.selectedOptions[0].value
        });
        this.creatingPerspective = false;
    }
    static get is() { return "uprtcl-toolbar"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "contextPerspectives": {
            "state": true
        },
        "creatingPerspective": {
            "state": true
        },
        "defaultService": {
            "type": String,
            "attr": "default-service"
        },
        "element": {
            "elementRef": true
        },
        "perspective": {
            "type": "Any",
            "attr": "perspective"
        }
    }; }
    static get events() { return [{
            "name": "createCommit",
            "method": "createCommit",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "selectPerspective",
            "method": "selectPerspective",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }, {
            "name": "createPerspective",
            "method": "createPerspectiveEvent",
            "bubbles": true,
            "cancelable": true,
            "composed": true
        }]; }
    static get style() { return ".flex-column {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: column;\n  flex-direction: column; }\n\n.flex-row {\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-direction: row;\n  flex-direction: row; }"; }
}

export { UptrclToolbar as UprtclToolbar };
