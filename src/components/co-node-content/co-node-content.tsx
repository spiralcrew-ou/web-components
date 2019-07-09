import {
  Component, Prop, Event, EventEmitter, Element, Listen, State } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { Block, setContent } from '../../actions';

@Component({
  tag: 'co-node-content',
  styleUrl: 'co-node-content.scss',
  shadow: true
})
export class CONodeContent {
  @Element() _element: HTMLElement;

  @State() keepContextMenu: boolean = false;
  @State() linkToAdd: string;
  @State() linkTextToAdd: string;
  @State() linkPosToAdd: number;  

  @Prop({ context: 'store' }) store: Store;
  @Prop() block: Block;
  @Prop() level: number;
  @Prop() canwrite: boolean;

  
  @Event({ eventName: 'isFocused', bubbles: true })
  isFocused: EventEmitter;

  setContent: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      setContent
    })
  }

  componentDidLoad() {
    const element = this._element.shadowRoot.getElementById(this.block.id);
    if (element) {
      element.focus();
      element.innerHTML = this.block.content
    }
  }

  async updateBlockContent(_event: FocusEvent, _newContent) {
    _event.stopPropagation()
    if (this.block) {
      if (_newContent !== this.block.content) {
        this.updateContent(_newContent);
      }
    }
  }

  async updateContent (_newContent: string) {
    await this.setContent(this.block.id, _newContent)
  }

  componentWillRender() {
    console.log('[WILL RENDER]', this.block)
    /** force reactivity */
    const element = this._element.shadowRoot.getElementById(this.block.id);
    if (element) {
      element.innerHTML = this.block.content
    }
  }

  @Listen('keyup') 
  onKeyUp() {
    this.checkSelection();
  }

  @Listen('mouseup') 
  onClick() {
    this.checkSelection();
  }

  checkSelection () {
    if (!this.keepContextMenu) {
      const selection = document.getSelection();
      if (selection.toString() !== '') {
        this.linkTextToAdd = selection.toString();
        /** select backwards to get position */
        selection['modify']("extend", "backward", "paragraphboundary");
        this.linkPosToAdd = selection.toString().length;
        /** unselect */
        selection.collapseToEnd();

        this.keepContextMenu = true;
        this.openContextMenu();
      } else {
        this.closeContextMenu();
      }
    }    
  }

  openContextMenu() {
    const menu = this._element.shadowRoot.getElementById('context-menu') as any;
    menu.style.display = 'block';
  }

  closeContextMenu() {
    const menu = this._element.shadowRoot.getElementById('context-menu') as any;
    menu.style.display = 'none';
  }

  insertLink() {
    const element = this._element.shadowRoot.getElementById(this.block.id);
    
    let innerHtml = element.innerHTML;

    /** remove the selected word */
    const left = innerHtml.slice(0, this.linkPosToAdd);
    const right = innerHtml.slice(this.linkPosToAdd + this.linkTextToAdd.length);
    
    const linkHtml = 
    `<span contentEditable="false">
      <a target="_blank" href=${this.linkToAdd}>${this.linkTextToAdd}</a>
    </span>`

    innerHtml = left + linkHtml + right;

    element.innerHTML = innerHtml;    
    this.closeContextMenu();
    this.updateContent(innerHtml);
  }

  handleLinkInput(event) {
    this.linkToAdd = event.target.value;
  }

  cancelLink() {
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    }

    this.keepContextMenu = false;
    this.closeContextMenu();
  }

  render() {
    const blockClasses = 'text-gray-800 node-content-container'
    const contentClasses = this.block.style === 'title' ? `title-${this.level + 1}` : 'paragraph'
    const classes = [
      blockClasses,
      contentClasses].join(" ")

    return (
    <div>
      <div
        id={this.block.id}
        onFocus={() => { 
          this.isFocused.emit(true)
        }}
        onBlur={event => {
          this.isFocused.emit(false);
          this.updateBlockContent(event, event['path'][0].innerHTML);
        }}
        class={classes}
        data-placeholder={this.level === 0 ? 'title' : 'empty'}
        contentEditable={this.canwrite}>
        
        {this.block.content}
        
      </div>
      <div 
        id="context-menu" 
        class="context-menu border-2 shadow-md rounded-lg bg-white" 
        onClick={()=> {}}>

        <input
          class="border-gray-400"
          onInput={event => this.handleLinkInput(event)}
          placeholder='url'>
        </input>
        <button class="font-thin" onClick={() => this.insertLink()}>ok</button>
        <button class="font-thin" onClick={() => this.cancelLink()}>close</button>
      </div>
    </div>
    )
  }
}