import { Component, Prop, State, Listen } from '@stencil/core';
import { MDCMenu } from '@material/menu';
// import { uuidv4 } from '../../utils/utils';
// import { fetchIniciative } from '../../actions';
import {createEmptyContext, createCommit} from '../../main_functions';
import { Store,Action } from '@stencil/redux';
import {callNewPerspective} from '../../actions';

let menu = null
let toolbar = null
let toolbarRight = null


@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: false
})
export class COEditor {
  @Prop({ context: 'store' }) store: Store
  @Prop() iniciativeId: string
  @Prop() documentId: string
  @Prop() revision: string = 'draft'
  @State() blocks = []
  @State() blockActiveId: string
  @State() currentBlock: any
  @State() lastCall: string

  dispatchCallNewPerspective: Action

  componentWillLoad = () => {
    // this.blocks = fetchIniciative().documents
    this.blocks = []
    this.blocks.push(createEmptyContext())
    console.log(this.blocks)
    this.store.mapStateToProps(this, state => {
      return {
        lastCall: state.coLastCall.callData ? state.coLastCall.callData.callId  : ''
      }
    })
    this.store.mapDispatchToProps(this,{
      dispatchCallNewPerspective:  callNewPerspective
    })
  }

  componentDidLoad = () => {
    menu = new MDCMenu(document.querySelector('.context_menu'))
    toolbar = new MDCMenu(document.querySelector('.editorToolbar'))
    toolbarRight = new MDCMenu(document.querySelector('.editorToolbarRight'))
  }

  componentDidUpdate = () => {
    console.log(this.blocks)
  }

  fixMenu = () => {
    const menu = document.querySelector('.context_menu')
    const _left = window.innerWidth - menu.getBoundingClientRect().width - 50
    menu.setAttribute("style", "left: " + _left + "px");
  }


  handleOpenToolbarRight = (e, block) => {
    console.log(e.x, e.y)
    console.log(toolbarRight.open)
    this.currentBlock = block
    toolbarRight.hoistMenuToBody()
    toolbarRight.setAbsolutePosition(e.x, e.y)
    toolbarRight.open = !toolbarRight.open
  }



  handleOpen = () => {
    menu.hoistMenuToBody()
    const el = document.querySelector('.context_menu')
    const _x = window.innerWidth - el.getBoundingClientRect().width - 40
    const _y = window.innerHeight - el.getBoundingClientRect().height - 90
    menu.setAbsolutePosition(_x, _y)
    menu.open = !menu.open
  }


  handleOpenToolbar = (e, block) => {
    this.currentBlock = block
    toolbar.hoistMenuToBody()
    toolbar.setAbsolutePosition(e.x, e.y)
    toolbar.open = !toolbar.open
  }

  handleMenuRight = () => {
    menu.hoistMenuToBody()
    const el = document.querySelector('.context_menu')
    const _x = window.innerWidth - el.getBoundingClientRect().width - 40
    const _y = window.innerHeight - el.getBoundingClientRect().height - 90
    menu.setAbsolutePosition(_x, _y)
    menu.open = !menu.open
  }

  changeFormat = (newType) => {
    const dummy = Object.assign([], this.blocks)
    const index = this.blocks.findIndex(e => e.id === this.currentBlock.id)
    dummy[index].type = newType
    this.blocks = dummy
  }

  allowDrop = ev => {
    ev.preventDefault();
    // console.log(ev.target.id)
  }

  drag = (ev) => {
    ev.dataTransfer.setData("text", ev.target.id)
    // console.log(ev)
  }


  drop = ev => {
    ev.preventDefault();

    const dummy = Object.assign([], this.blocks.filter(e => e.id != this.currentBlock.id))
    const index = this.blocks.findIndex(e => e.id === ev.target.attributes.id.nodeValue)
    dummy.splice(index, 0, this.currentBlock)
    this.blocks = dummy
  }

  hexString(buffer) {
    const byteArray = new Uint8Array(buffer);
  
    const hexCodes = [...byteArray].map(value => {
      const hexCode = value.toString(16);
      const paddedHexCode = hexCode.padStart(2, '0');
      return paddedHexCode;
    });
  
    return hexCodes.join('');
  }
  

  save = () => {  
    let contextId =null
    let head = null
    let dataId = null
    const finalList = []
    this.blocks.forEach(block => {
      contextId = Object.keys(block)[0]
      head = block[contextId].root.head
      dataId = block[contextId].commits.commit[head].content.data
      block[contextId].data[dataId].content = document.getElementById(contextId).innerHTML
      finalList.push(createCommit('anonymous',block))
    })
    this.blocks = finalList
    //console.log(createEmptyContext('anonymous'))
  }



  syncBlock = blockId => {
    console.log(blockId)
    const dummy = Object.assign([], this.blocks)
    const index = this.blocks.findIndex(e => e.id === blockId)
    dummy[index].content = document.getElementById(blockId).innerHTML
    this.blocks = dummy
  }

  @Listen('keydown')
  handleKeyDown(ev: KeyboardEvent) {
    
    if (ev.key === 'Enter') {
      ev.preventDefault()
      const dummy = Object.assign([],this.blocks)
      dummy.push(createEmptyContext())
      this.blocks = dummy 
      //console.log(this.blocks)
    }

    if ((ev.key === 'Backspace') && (document.getElementById(this.blockActiveId).innerHTML.length <= 1)) {
      const dummy = Object.assign([], this.blocks)
      this.blocks = dummy.filter(e => e.id != this.blockActiveId)
    }
  }

  @Listen('activeBlock')
  handleBlockActive(ev: CustomEvent) {

    this.blockActiveId = ev.detail
    //console.log(ev.detail)
    // this.syncBlock(this.blockActiveId)
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
    const currentBlock = this.blocks.filter(b => Object.keys(b)[0] === this.blockActiveId )[0]
    return <div class="editorToolbarRight mdc-menu mdc-menu-surface" >
      <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
        <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem" onClick={() =>  this.dispatchCallNewPerspective(currentBlock)}>
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

  renderBlock = block => {
    const contextId = Object.keys(block)[0]
    const head = block[contextId].root.head
    const dataId = block[contextId].commits.commit[head].content.data
    switch (block[contextId].commits.commit[head].type) {
      case 'co-title1':
        return <co-title1 block_id={block[contextId].root.contextId} content={block[contextId].data[dataId].content}></co-title1>
      case 'co-title2':
        return <co-title2 block_id={block[contextId].root.contextId} content={block[contextId].data[dataId].content}></co-title2>
      case 'co-subtitle1':
        return <co-subtitle1 block_id={block[contextId].root.contextId} content={block[contextId].data[dataId].content}></co-subtitle1>
      case 'co-subtitle2':
        return <co-subtitle2 block_id={block[contextId].root.contextId} content={block[contextId].data[dataId].content}></co-subtitle2>
      case 'co-paragraph':
        return <co-paragraph block_id={block[contextId].root.contextId} content={block[contextId].data[dataId].content}></co-paragraph>
      default:
        return <co-paragraph block_id={block[contextId].root.contextId} content={block[contextId].data[dataId].content}></co-paragraph>
    }

  }


  render() {

    // <div class='block' draggable={true} onDragOver={event => this.allowDrop(event)} onDrop={event => this.drop(event)} onDragStart = {this.drag} onMouseDown={() => this.currentBlock = block}></div>
    if (this.lastCall === 'NEW_PERSPECTIVE')
      return (<co-new-perspective></co-new-perspective>)

    return (
      <div>
        <main class="main-content" id="main-content">
          {this.blocks.map(block => (
            <div class="block">
              <button class="mdc-icon-button material-icons ghost" onClick={e => this.handleOpenToolbar(e, block)}>format_size</button>
              {this.renderBlock(block)}
              <button class="mdc-icon-button material-icons ghost" onClick={e => this.handleOpenToolbarRight(e, block)} >
                <a class="demo-menu material-icons mdc-top-app-bar__navigation-icon">more_vert</a>
              </button>

            </div>
          ))}
          {this.renderToolbarRight()}

          {this.renderToolbar()}
          <button id="menu-button" class="mdc-fab app-fab--absolute" aria-label="Favorite" onClick={this.handleOpen}>
            <span class="mdc-fab__icon material-icons" >create</span>
          </button>

          <div class="context_menu mdc-menu mdc-menu-surface ">
            <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
              <li class="mdc-list-item mdc-ripple-upgraded" role="menuitem">
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
