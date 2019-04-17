import { Component } from '@stencil/core';
import MediumEditor from 'medium-editor'
import { MDCMenu } from '@material/menu';

let menu = null


@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: false
})
export class MyComponent {

  fixMenu = () => {
    const menu = document.querySelector('.mdc-menu')
    const _left = window.innerWidth - menu.getBoundingClientRect().width - 50
    menu.setAttribute("style", "left: " + _left + "px");
  }

  handleOpen = () => {
    menu.hoistMenuToBody()
    const el = document.querySelector('.mdc-menu')
    const _x = window.innerWidth - el.getBoundingClientRect().width - 40
    const _y = window.innerHeight - el.getBoundingClientRect().height - 90
    menu.setAbsolutePosition(_x, _y)
    menu.open = !menu.open
  }

  componentDidLoad = () => {
    menu = new MDCMenu(document.querySelector('.mdc-menu'))
    

    var editor = new MediumEditor('.editable', {
      placeholder: {
        text: 'Please, click to start'
      }
    })
    window['editor'] = editor
  }

  render() {
    return (
      <div>
        <div class="editable"></div>


        <button id="menu-button" class="mdc-fab app-fab--absolute" aria-label="Favorite" onClick={this.handleOpen}>
          <span class="mdc-fab__icon material-icons" >create</span>
        </button>

        <div class="mdc-menu mdc-menu-surface ">
          <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
          <li class="mdc-list-item" role="menuitem">
              <i class="material-icons mdc-list-item__graphic" aria-hidden="true">call_split</i>
              <span class="mdc-list-item__text">New Version</span>
            </li>
            <li class="mdc-list-item" role="menuitem">
              <i class="material-icons mdc-list-item__graphic" aria-hidden="true">merge_type</i>
              <span class="mdc-list-item__text">Merge</span>
            </li>
            <li class="mdc-list-item" role="menuitem">
              <i class="material-icons mdc-list-item__graphic" aria-hidden="true">done</i>
              <span class="mdc-list-item__text">Save</span>
            </li>
            <li class="mdc-list-item" role="menuitem">
              <i class="material-icons mdc-list-item__graphic" aria-hidden="true">share</i>
              <span class="mdc-list-item__text">Share</span>
            </li>
            <li class="mdc-list-item" role="menuitem">
              <i class="material-icons mdc-list-item__graphic" aria-hidden="true">tune</i>
              <span class="mdc-list-item__text">Settings</span>
            </li>
            <li class="mdc-list-item" role="menuitem">
              <i class="material-icons mdc-list-item__graphic" aria-hidden="true">publish</i>
              <span class="mdc-list-item__text">Publish</span>
            </li>
            
            
          </ul>
        </div>

      </div>)
  }
}
