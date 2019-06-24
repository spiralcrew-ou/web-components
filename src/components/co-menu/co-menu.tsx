import { Component, Element, Prop, State } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { setStyle, closeMenu, Block, renderingWorkpad, NodeType } from '../../actions';

@Component({
  tag: 'co-menu',
  styleUrl: 'co-menu.scss',
  shadow: true
})
export class COMenu {
  @Element() _element: HTMLElement;
  @Prop({ context: 'store' }) store: Store;
  @State() block: Block;
  @State() parentId;
  @State() index;

  setStyle: Action
  closeMenu: Action
  renderingWorkpad: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      setStyle,
      closeMenu,
      renderingWorkpad
    })
    this.store.mapStateToProps(this,(state) => {
      return {
        block: state.workpad.tree[state.menu.inBlockData.blockId],
        parentId: state.menu.inBlockData.parentId,
        index: state.menu.inBlockData.index,
      }
    })
  }

  setBlockStyle(newStyle: NodeType) {
    this.setStyle(this.block.id, newStyle, this.parentId, this.index)
    this.closeMenu()
  }

  render() {
    return <div class='container m-4 w-1/4 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white' >
      <div class= 'block my-2 pl-2' onClick={ () => {
        this.setBlockStyle(NodeType.title)
      }}> This is a title</div>
      <div  class= 'block my-2 pl-2 '  onClick={ () => {
        this.setBlockStyle(NodeType.paragraph)
      }}>this is a paragraph</div>
    </div>
  }
}
