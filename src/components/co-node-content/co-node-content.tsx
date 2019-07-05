import {
  Component, Prop, Element, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { Block, setContent } from '../../actions';

@Component({
  tag: 'co-node-content',
  styleUrl: 'co-node-content.scss',
  shadow: false
})
export class CONodeContent {
  @Element() _element: HTMLElement;
  
  @Prop({ context: 'store' }) store: Store;
  @Prop() block: Block;
  @Prop() level: number;
  @Prop() canWrite: boolean;

  @Event({ eventName: 'isFocused', bubbles: true })
  isFocused: EventEmitter;

  setContent: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      setContent
    })
  }

  componentDidLoad() {
  }

  async updateBlockContent(_event: FocusEvent, _newContent) {
    _event.stopPropagation()
    if (this.block) {
      if (_newContent != this.block.content)
        await this.setContent(this.block.id, _newContent)
    }
  }

  render() {
    console.log('rendegin', this.block);

    const blockClasses = 'text-gray-800 node-content-container'
    const contentClasses = this.block.style === 'title' ? `title-${this.level + 1}` : 'paragraph'
    const classes = [
      blockClasses,
      contentClasses].join(" ")

    const containerClasses = [].join(" ")

    return (
    <div class={containerClasses}>
      <div
        key={this.block.id}
        onFocus={() => { this.isFocused.emit(true)}}
        onBlur={event => {
          this.isFocused.emit(false);
          this.block.content = '';
          this.updateBlockContent(event, event['path'][0].innerText);
        }}
        class={classes}
        data-placeholder={'empty'}
        id={this.block.id}
        contentEditable={this.canWrite}>
        {this.block.content}
      </div>
    </div>
    )
  }
}