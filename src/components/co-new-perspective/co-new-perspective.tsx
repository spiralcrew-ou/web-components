import { Component} from '@stencil/core';


@Component({
  tag: 'co-new-perspective',
  styleUrl: 'co-new-perspective.scss'
})



export class NewPerspective {
 


  render() {
    return <div>
        <button class="mdc-icon-button material-icons">close</button>
        <div class="content">
        <div class="mdc-text-field mdc-text-field--fullwidth">
        <input class="mdc-text-field__input"
                type="text"
                placeholder="add description here"
                aria-label="Full-Width Text Field"/>
        </div>
        </div>
        <button class="mdc-fab mdc-fab--extended app-fab--absolute">
            <span class="material-icons mdc-fab__icon">add</span>
            <span class="mdc-fab__label">Create</span>
        </button>
    </div>;
  }
}
