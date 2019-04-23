import { Component, Prop, State, Listen } from '@stencil/core';
import { MDCMenu } from '@material/menu';
import { uuidv4 } from '../../utils/utils';

let menu = null
let toolbar = null


@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: false
})
export class COEditor {

  @Prop() iniciativeId: string
  @Prop() documentId: string
  @Prop() revision: string = 'draft'
  @State() blocks = []
  @State() blockActiveId: string

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

  handleOpenToolbar = (e) => {
    console.log(e)
    toolbar.hoistMenuToBody()
    //const el = document.querySelector('.editorToolbar')
    // const _x = window.innerWidth - el.getBoundingClientRect().width - 40
    // const _y = window.innerHeight - el.getBoundingClientRect().height - 90
    toolbar.setAbsolutePosition(e.x, e.y)
    toolbar.open = !toolbar.open
  }

  save = () => {
    
  }

  componentWillLoad = () => {
    this.blocks = [{
      id: uuidv4(),
      type: 'co-paragraph',
      content: ''
    }]
  }

  @Listen('keydown')
  handleKeyDown(ev: KeyboardEvent) {
    const newLine = {
      id: uuidv4(),
      type: 'co-paragraph',
      content: ''
    }

    if (ev.key === 'Enter') {
      const dummy = Object.assign([], this.blocks)
      const index = this.blocks.findIndex(e => e.id === this.blockActiveId)
      dummy[index].content.replace(/\n/g, '')
      dummy.splice(index + 1, 0, newLine)
      this.blocks = dummy
      ev.preventDefault()
    }

    if ((ev.key === 'Backspace') && (document.getElementById('CO-ELID-' + this.blockActiveId).innerHTML.length <= 1)) {
      const dummy = Object.assign([], this.blocks)
      this.blocks = dummy.filter(e => e.id != this.blockActiveId)
    }

  }

  @Listen('activeBlock')
  handleBlockActive(ev: CustomEvent) {

    this.blockActiveId = ev.detail
  }

  componentDidLoad = () => {
    menu = new MDCMenu(document.querySelector('.mdc-menu'))
    toolbar = new MDCMenu(document.querySelector('.editorToolbar'))
  }


  renderToolbar = () => {
    
    return <div class="editorToolbar mdc-menu mdc-menu-surface ">
      <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
        <li class="mdc-list-item" role="menuitem">
          <i class="material-icons mdc-list-item__graphic" aria-hidden="true">format_size</i>
          <span class="mdc-list-item__text">Header1</span>
        </li>
        <li class="mdc-list-item" role="menuitem">
          <i class="material-icons mdc-list-item__graphic" aria-hidden="true">format_size</i>
          <span class="mdc-list-item__text">Header2</span>
        </li>
        <li class="mdc-list-item" role="menuitem">
          <i class="material-icons mdc-list-item__graphic" aria-hidden="true">format_textdirection_l_to_r</i>
          <span class="mdc-list-item__text">Paragraph</span>
        </li>
      </ul>
    </div>
  }

  renderBlock = block => {
    switch (block.type) {
      case 'co-title1':
        return <co-title1 block_id={block.id} content={block.content}></co-title1>
      case 'co-title2':
        return <co-title2 block_id={block.id} content={block.content}></co-title2>
      case 'co-subtitle1':
        return <co-subtitle1 block_id={block.id} content={block.content}></co-subtitle1>
      case 'co-subtitle2':
        return <co-subtitle2 block_id={block.id} content={block.content}></co-subtitle2>
      case 'co-paragraph':
        return <co-paragraph block_id={block.id} content={block.content}></co-paragraph>
      default:
        return <co-paragraph block_id={block.id} content={block.content}></co-paragraph>

    }

  }

  render() {
    return (
      <div>
        {this.blocks.map(block => (
          <div class='block'>
            <button class="mdc-icon-button material-icons ghost" onClick={ e => this.handleOpenToolbar(e)}>menu</button>
            {this.renderBlock(block)}
            <button class="mdc-icon-button material-icons ghost">more_vert</button>
          </div>
        ))}

        {this.renderToolbar()}
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
            <li class="mdc-list-item" role="menuitem" onClick={this.save}>
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
              <i class="material-icons mdc-list-item__graphic" aria-hidden="true">swap_vert</i>
              <span class="mdc-list-item__text">Change Perspective</span>
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
