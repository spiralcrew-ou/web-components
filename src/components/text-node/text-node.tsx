import {
  Component,
  Prop,
  Event,
  EventEmitter,
  State,
  Watch,
  Element,
  Listen
} from '@stencil/core';
import { DataService } from '../../services/data.service';
import { DataHolochain } from '../../services/holochain/data.holochain';

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

  @Prop() dataId: string;
  @State() loading: boolean = !!this.dataId;

  @State() private node: TextNode = {
    text: '',
    links: []
  };

  newText: string;

  @Event({
    bubbles: true, // Not sure if necessary
    composed: true, // At least necessary if we want to use shadowDom
    eventName: 'commit-content'
  })
  commitContent: EventEmitter;

  data: DataService = new DataHolochain();

  loadData() {
    if (this.dataId) {
      this.loading = true;
      this.data.getData(this.dataId).then(node => {
        this.node = node;
        this.loading = false;
      });
    }
  }

  componentWillLoad() {
    this.loadData();
  }

  @Watch('dataId')
  dataChanged() {
    this.loadData();
  }

  render() {
    return (
      <div>
        {this.loading ? (
          <span>Loading...</span>
        ) : (
          <div>
            <span
              id="text"
              data-focused-advice="Start typing"
              contenteditable="true"
              onInput={() => this.updateText()}
            >
              {this.node.text}
            </span>

            {this.node.links.map((link, index) => (
              <uprtcl-perspective
                perspectiveId={link}
                onPerspectiveCreated={e => this.perspectiveCreated(index, e)}
              >
                <text-node />
              </uprtcl-perspective>
            ))}
          </div>
        )}
      </div>
    );
  }

  updateText() {
    // HELP: Get the value of the <span id="text"> and store it in newText
    this.newText = this.element.querySelector('#text').innerHTML;
  }

  @Listen('keydown')
  onKeyDown(event) {
    if (event.key === 'Enter') {
      const links = [...this.node.links, null];
      // Force rerendering of the component
      this.node = { ...this.node, links: links };
    }
  }

  perspectiveCreated(index: number, event: CustomEvent) {
    this.node.links[index] = event.detail.perspectiveId;
    // We need to immediately save the content with the new link not to lose the relationship
    this.saveContent();
    event.stopPropagation();
  }

  async saveContent() {
    const node: TextNode = { ...this.node };
    if (this.newText) {
      node.text = this.newText;
    }
    this.data.createData(node).then(nodeId => this.commitContent.emit(nodeId));
  }
}
