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

  @Prop() id: string;
  @Prop() text: string;

  @Event({
    bubbles: true,
    composed: true,
    eventName: 'content-changed'
  })
  contentChanged: EventEmitter;

  // Keep timeout to cancel debounce typing
  changeTextTimeout = null;

  componentDidLoad() {
    const element = this.element.shadowRoot.getElementById(this.id);
    if (element) element.focus();
  }

  componentWillUpdate() {
    const element = this.element.shadowRoot.getElementById(this.id);
    if (element) element.innerHTML = this.text;
  }

  render() {
    return (
      <div>
        <span
          id={this.id}
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
        const newText = this.element.shadowRoot.getElementById(this.id)
          .innerText;
        this.contentChanged.emit(newText);
      }, 2000);
    }
  }
}
