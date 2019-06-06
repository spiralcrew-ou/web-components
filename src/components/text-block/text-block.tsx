import {
  Component,
  Prop,
  Element,
  Listen,
  Event,
  EventEmitter
} from '@stencil/core';

@Component({
  tag: 'text-block',
  styleUrl: 'text-block.scss',
  shadow: true
})
export class TextBlock {
  @Element() private element: HTMLElement;

  @Prop() text: string;

  @Event({
    bubbles: true,
    composed: true,
    eventName: 'content-changed'
  })
  contentChanged: EventEmitter;

  // Keep timeout to cancel debounce typing
  changeTextTimeout = null;

  componentWillUpdate() {
    this.element.shadowRoot.getElementById('text').innerHTML = this.text;
  }

  render() {
    return (
      <div>
        <span
          id='text'
          class='text-block'
          data-placeholder='Start typing...'
          contenteditable='true'
        >
          {this.text}
        </span>
      </div>
    );
  }

  @Listen('keydown')
  onKeyDown(event) {
    if (event.key !== 'Enter') {
      event.stopPropagation();

      // Debounce to not save every key down but every two seconds of change
      if (this.changeTextTimeout) {
        clearTimeout(this.changeTextTimeout);
      }

      this.changeTextTimeout = setTimeout(() => {
        // Get the new text and emit it
        const newText = this.element.shadowRoot.getElementById('text')
          .innerText;
        this.contentChanged.emit(newText);
      }, 2000);
    }
  }
}
