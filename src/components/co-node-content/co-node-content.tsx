import {
  Component, Prop, Event, EventEmitter, Element } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { Block, setContent } from '../../actions';

@Component({
  tag: 'co-node-content',
  styleUrl: 'co-node-content.scss',
  shadow: true
})
export class CONodeContent {
  @Element() _element: HTMLElement;
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
      if (_newContent !== this.block.content)
        await this.setContent(this.block.id, _newContent)
    }
  }

  componentWillRender() {
    console.log('[WILL RENDER]', this.block)
    /** force reactivity */
    const element = this._element.shadowRoot.getElementById(this.block.id);
    if (element) {
      element.innerHTML = this.block.content
    }
  }

  render() {
    const blockClasses = 'text-gray-800 node-content-container'
    const contentClasses = this.block.style === 'title' ? `title-${this.level + 1}` : 'paragraph'
    const classes = [
      blockClasses,
      contentClasses].join(" ")

    const containerClasses = [].join(" ")

    return (
    <div class={containerClasses}>
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
        data-placeholder={'empty'}
        contentEditable={this.canwrite}>
        {this.block.content}
      </div>
    </div>
    )
  }
}