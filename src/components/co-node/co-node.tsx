import {
  Component, State, Prop, Element, Listen
} from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { newBlock, removeBlock } from '../../actions';

@Component({
  tag: 'co-node',
  styleUrl: 'co-node.scss',
  shadow: true
})
export class CONode {
  @Element() _element: HTMLElement;
  @Prop({ context: 'store' }) store: Store;
  @Prop() id: string;
  @Prop() parentId: string;
  @Prop() index: string;

  @State() block;

  newBlock: Action
  removeBlock: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      newBlock,
      removeBlock
    })
    this.store.mapStateToProps(this, state => {
      return {
        block: Object.assign([], state.workpad.tree[this.id])
      }
    })
  }

  @Listen('keydown')
  onKeyDown(event: KeyboardEvent) {

    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();

      if ((this.block.style == 'title') || (this.block.style == 'bullet_list')) {
        this.newBlock({ status: 'DRAFT', content: '', type: 'paragraph' }, this.id, 0)
      } else {
        this.newBlock({ status: 'DRAFT', content: '', type: 'paragraph' }, this.parentId, this.index + 1)
      }
    }

    if (event.key === 'Backspace') {
      if (event['path'][0].innerText === '') {
        // this.removeBlock(this.findBlock(this.id))
        /**TODO: What happend if document have only one element? That means, 
         * we need to consireded if user try to remove all blocks from document. 
         *  It make sense? 
         * IMPORTANT TO SEE WITH PEPO. User delete only one word and then type the same word. 
         * We need to create a new Draft in this case? 
          */

        // this.updateTree(newTree)
      }
    }
  }

  render() {
    return (
      <div>
        <div id={this.id + this.parentId + '-content'}>
          {this.block.content}
        </div>
        {this.block.children.map((childId, index) => {
          (
            <co-node class='container'>
              id={childId},
                parentId={this.id}
              index={index}
            </co-node>
          )
        })}
      </div>
    )
  }
}