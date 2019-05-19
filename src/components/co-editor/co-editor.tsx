import { Component, Prop, State, Listen } from '@stencil/core';
import { MDCMenu } from '@material/menu';
import { Store, Action } from '@stencil/redux';
import { callNewPerspective } from '../../actions';
import { createEmptyContext, updateContent, newPerspective } from '../../globals/database';
import { MDCDialog } from '@material/dialog';

let menu = null
let toolbar = null
let toolbarRight = null
let dialogNewPerspective = null


@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: false
})
export class COEditor {
  @Prop({ context: 'store' }) store: Store
  @State() blocks = []
  @Prop() mainContextId: string
  @State() blockActiveId: string
  @State() currentBlock: any
  @State() lastCall: string
  @State() rootDocument: any = null
  @State() newPerspectiveName: string = ''
  @State() toolbarState: boolean = false 
  @State() toolbarRightState: boolean = false 


  dispatchCallNewPerspective: Action

  async componentWillLoad() {
    // this.blocks = fetchIniciative().documents
    if (!this.rootDocument) {
      this.rootDocument = await createEmptyContext('peterparker', 'This is the first context of document')
      const first_block = await createEmptyContext('peterparker', 'First block')
      this.rootDocument.context.perspectives.push(first_block.perspective)
    }
    this.blocks = []

    this.store.mapStateToProps(this, state => {
      return {
        lastCall: state.coLastCall.callData ? state.coLastCall.callData.callId : ''
      }
    })
    this.store.mapDispatchToProps(this, {
      dispatchCallNewPerspective: callNewPerspective
    })
  }

  componentDidLoad = () => {
    menu = new MDCMenu(document.querySelector('.context_menu'))
    toolbar = new MDCMenu(document.querySelector('.editorToolbar'))
    toolbar.hoistMenuToBody()
    toolbarRight = new MDCMenu(document.querySelector('.editorToolbarRight'))
    toolbarRight.hoistMenuToBody()
    dialogNewPerspective = new MDCDialog(document.querySelector('.dialog-new-perspective'));

    document.body.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') {
        this.closeAllMenu()
      }

      if (ev.key === 'Enter') {
        ev.preventDefault()
        createEmptyContext('peterparker', 'Another block').then(newBlock => {
          const doc = this.rootDocument
          doc.context.perspectives.push(newBlock.perspective)
          this.rootDocument = Object.assign({}, doc)
        })
      }

      if ((ev.key === 'Backspace') && (document.getElementById(this.blockActiveId).innerHTML.length <= 1)) {
        const dummy = Object.assign([], this.blocks)
        this.blocks = dummy.filter(e => e.id != this.blockActiveId)
      }
    })
  }

  fixMenu = () => {
    const menu = document.querySelector('.context_menu')
    const _left = window.innerWidth - menu.getBoundingClientRect().width - 50
    menu.setAttribute("style", "left: " + _left + "px");
  }


  handleOpenToolbarRight = (event, block) => {
    this.currentBlock = block
    const el = document.querySelector('.editorToolbarRight') as HTMLElement
    this.toolbarRightState = !this.toolbarRightState
    el.style.left =  event.clientX - 200 + "px"
    el.style.top = event.clientY + "px"
    if (this.toolbarRightState)
      el.classList.add('mdc-menu-surface--open')
    else
      el.classList.remove('mdc-menu-surface--open')
  }


  closeAllMenu = () => {
    const toolbar = document.querySelector('.editorToolbar') as HTMLElement
    const toolbarRight = document.querySelector('.editorToolbarRight') as HTMLElement
    toolbar.classList.remove('mdc-menu-surface--open')
    toolbarRight.classList.remove('mdc-menu-surface--open')
  }

  handleOpen = () => {
    menu.hoistMenuToBody()
    const el = document.querySelector('.context_menu')
    const _x = window.innerWidth - el.getBoundingClientRect().width - 40
    const _y = window.innerHeight - el.getBoundingClientRect().height - 90
    menu.setAbsolutePosition(_x, _y)
    menu.open = !menu.open
  }


  handleOpenToolbar = (event,block) => {
    this.currentBlock = block
    console.log(event.clientX,event.clientY)

    const el = document.querySelector('.editorToolbar') as HTMLElement
    el.style.left="16px"
    el.style.top=event.clientY  + "px"
    this.toolbarState = !this.toolbarState
    if (this.toolbarState)
      el.classList.add('mdc-menu-surface--open')
    else
      el.classList.remove('mdc-menu-surface--open')
  }

  handleOpenNewPerspectiveDialog = () => {

    if (dialogNewPerspective.isOpen)
      dialogNewPerspective.close()
    else
      dialogNewPerspective.open()

  }

  changeFormat = (newType) => {
    const dummy = Object.assign([], this.blocks)
    const index = this.blocks.findIndex(e => e.id === this.currentBlock.id)
    dummy[index].type = newType
    this.blocks = dummy
  }

  save = () => {
    const contexts = document.querySelectorAll('.contextObject')
    contexts.forEach(e =>
      updateContent(e.id, {
        type: 'co-paragraph',
        value: e.innerHTML
      }))
  }

  syncBlock = blockId => {
    console.log(blockId)
    const dummy = Object.assign([], this.blocks)
    const index = this.blocks.findIndex(e => e.id === blockId)
    dummy[index].content = document.getElementById(blockId).innerHTML
    this.blocks = dummy
  }


  @Listen('activeBlock')
  handleBlockActive(ev: CustomEvent) {
    this.blockActiveId = ev.detail
  }


  renderToolbar = () => {
    return <div class="editorToolbar mdc-menu mdc-menu-surface" >
      <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
        <li class="mdc-list-item" role="menuitem" onClick={() => this.changeFormat('co-title1')}>
          <span class="mdc-list-item__text">Title1</span>
        </li>
        <li class="mdc-list-item" role="menuitem" onClick={() => this.changeFormat('co-title2')}>
          <span class="mdc-list-item__text">Title2</span>
        </li>
        <li class="mdc-list-item" role="menuitem" onClick={() => this.changeFormat('co-subtitle1')}>
          <span class="mdc-list-item__text">Subtitle1</span>
        </li>
        <li class="mdc-list-item" role="menuitem" onClick={() => this.changeFormat('co-subtitle2')}>
          <span class="mdc-list-item__text">Subtitle2</span>
        </li>
        <li class="mdc-list-item" role="menuitem" onClick={() => this.changeFormat('co-paragraph')}>
          <span class="mdc-list-item__text">Paragraph</span>
        </li>
      </ul>
    </div>
  }

  renderToolbarRight = () => {
    return <div class="editorToolbarRight mdc-menu mdc-menu-surface" >
      <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
        <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem" onClick={() => this.handleOpenNewPerspectiveDialog()}>
          New Perspective
            <i class="mdc-list-item__meta material-icons " aria-hidden="true">call_split</i>
        </li>
        <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
          Merge
          <i class="mdc-list-item__meta material-icons " aria-hidden="true">merge_type</i>
        </li>
        <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
          Change Perspective
          <i class="mdc-list-item__meta material-icons " aria-hidden="true">swap_vert</i>
        </li>
        <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
          Comments
          <i class="mdc-list-item__meta material-icons " aria-hidden="true">comment</i>
        </li>
      </ul>
    </div>
  }


  renderNewPerspectiveDialog = () => {
    return (<div class="mdc-dialog dialog-new-perspective"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="my-dialog-title"
      aria-describedby="my-dialog-content">
      <div class="mdc-dialog__container">
        <div class="mdc-dialog__surface">

          <h2 class="mdc-dialog__title" id="my-dialog-title">New Perspective </h2>
          <div class="mdc-dialog__content" id="my-dialog-content">
          <div class="mdc-text-field mdc-text-field--outlined mdc-text-field--no-label">
            <input type="text" class="mdc-text-field__input" aria-label="Label"></input>
            <div class="mdc-notched-outline">
              <div class="mdc-notched-outline__leading"></div>
              <div class="mdc-notched-outline__trailing"></div>
            </div>
          </div>
          </div>
          <footer class="mdc-dialog__actions">
            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close" >
              <span class="mdc-button__label">Cancel</span>
            </button>
            <button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="accept" onClick={() => newPerspective(this.currentBlock)}>
              <span class="mdc-button__label">OK</span>
            </button>
          </footer>
        </div>
      </div>
      <div class="mdc-dialog__scrim"></div>
    </div>)
  }


  renderBlock(perspective) {
    return <co-paragraph block_id={perspective.headObject.contentObject.id} content={perspective.headObject.contentObject.content}></co-paragraph>
  }


  render() {
    return (
      <div>
        <main class="main-content" id="main-content">
          {this.rootDocument.context.perspectives.map(perspective => (
            <div class="block">
              <button class="mdc-icon-button material-icons ghost" onClick={ event => this.handleOpenToolbar(event, perspective)}>format_size</button>
              {this.renderBlock(perspective)}
              <button class="mdc-icon-button material-icons ghost" onClick={event => this.handleOpenToolbarRight(event, perspective)} >
                <a class="demo-menu material-icons mdc-top-app-bar__navigation-icon">more_vert</a>
              </button>

            </div>
          ))}
          {this.renderToolbarRight()}
          {this.renderNewPerspectiveDialog()}
          {this.renderToolbar()}
          <button id="menu-button" class="mdc-fab app-fab--absolute" aria-label="Favorite" onClick={this.handleOpen}>
            <span class="mdc-fab__icon material-icons" >create</span>
          </button>

          <div class="context_menu mdc-menu mdc-menu-surface ">
            <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem"  onClick={() => this.handleOpenNewPerspectiveDialog()}>
                New perspective
                      <i class="mdc-list-item__meta material-icons " aria-hidden="true">call_split</i>
              </li>
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
                Merge
                      <i class="mdc-list-item__meta material-icons " aria-hidden="true">merge_type</i>
              </li>
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem" onClick={this.save}>
                Save
                      <i class="mdc-list-item__meta material-icons " aria-hidden="true">done</i>
              </li>
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
                Share
                      <i class="mdc-list-item__meta material-icons " aria-hidden="true">share</i>
              </li>
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
                Settings
                      <i class="mdc-list-item__meta material-icons " aria-hidden="true">tune</i>
              </li>
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
                Change Perspective
                      <i class="mdc-list-item__meta material-icons " aria-hidden="true">swap_vert</i>
              </li>
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
                Comments
                      <i class="mdc-list-item__meta material-icons " aria-hidden="true">comment</i>
              </li>
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
                Publish
                      <i class="mdc-list-item__meta material-icons " aria-hidden="true">cloud_upload</i>
              </li>
            </ul>
          </div>
        </main>
      </div>)
  }
}
