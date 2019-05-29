import {
  Component,
  Prop,
  Event,
  EventEmitter,
  State,
  Element,
  Listen
} from '@stencil/core';

interface TextNode {
  id?: string;
  text: string;
  links: string[]; // Links to the children perspectives
}

@Component({
  tag: 'text-node',
  styleUrl: 'text-node.scss',
  shadow: true
})
export class TextNodeElement {
  @Element() private element: HTMLElement;

  @Prop() data: TextNode;

  @State() node = this.data;

  newText: string;

  @Event({
    bubbles: true, // Not sure if necessary
    composed: true, // At least necessary if we want to use shadowDom
    eventName: 'commit-content'
  })
  commitContent: EventEmitter;

  render() {
    return (
      <div>
        <span
          id="text"
          data-focused-advice="Start typing"
          contenteditable="true"
        >
          {this.data.text}
        </span>

        {this.data.links.map((link) => (
          <uprtcl-perspective perspectiveId={link}>
            <data-resolver>
              <text-node />
            </data-resolver>
          </uprtcl-perspective>
        ))}
      </div>
    )
  }

  @Listen('keydown')
  onKeyDown(event) {
    if (event.key === 'Enter') {
      /* change parent perspective draft to add a new link to textNode next to this */
    } else {
      /* emit something that updates the draft of this element data */
    }
  }
}
