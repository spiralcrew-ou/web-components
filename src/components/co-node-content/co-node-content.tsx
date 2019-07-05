import {
  Component, Prop, Event, EventEmitter } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { Block, setContent } from '../../actions';

@Component({
  tag: 'co-node-content',
  styleUrl: 'co-node-content.scss',
  shadow: false
})
export class CONodeContent {
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
  }

  async updateBlockContent(_event: FocusEvent, _newContent) {
    _event.stopPropagation()
    if (this.block) {
      if (_newContent != this.block.content)
        await this.setContent(this.block.id, _newContent)
    }
  }

  render() {
    console.log('rendering', this.block);

    const blockClasses = 'text-gray-800 node-content-container'
    const contentClasses = this.block.style === 'title' ? `title-${this.level + 1}` : 'paragraph'
    const classes = [
      blockClasses,
      contentClasses].join(" ")

    const containerClasses = [].join(" ")

    return (
    <div class={containerClasses}>
      <div
        onFocus={() => { 
          this.isFocused.emit(true)
        }}
        onBlur={event => {
          this.isFocused.emit(false);
          this.block.content = '';
          console.log('[BLUR EVENT]', event)
          this.updateBlockContent(event, event['path'][0].innerText);
        }}
        class={classes}
        data-placeholder={'empty'}
        contentEditable={this.canWrite}>
        {this.block.content}
      </div>
    </div>
    )
  }
}