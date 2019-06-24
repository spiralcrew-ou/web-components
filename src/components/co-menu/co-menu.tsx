import { Component, Element, Prop, State } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import { setStyle, closeMenu,renderingWorkpad } from '../../actions';

@Component({
  tag: 'co-menu',
  styleUrl: 'co-menu.scss',
  shadow: true
})
export class COMenu {
  @Element() _element: HTMLElement;
  @Prop({ context: 'store' }) store: Store;
  @Prop() nodeId: string
  @State() block 

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
        block: state.workpad.tree[state.menu.blockId]
      }
    })
  }

  changeStyle(style:string) {
    this.renderingWorkpad(true)
    this.setStyle(this.block.id, style)
    this.closeMenu()
  }

  render() {
    return <div class='container m-4 w-1/4 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white' >
      <div class= 'block my-2 pl-2' onClick={ () => {
       this.setStyle('title')
      }}> This is a title</div>
      <div  class= 'block my-2 pl-2 '  onClick={ () => {
       this.setStyle('paragraph')
      }}>this is a paragraph</div>
    </div>
  }
}
