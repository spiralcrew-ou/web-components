import { Component, Element, Prop, State } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {setView, closeMenu} from '../../actions';

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

  setView: Action
  closeMenu: Action

  componentWillLoad() {
    this.store.mapDispatchToProps(this, {
      setView,
      closeMenu
    })
    this.store.mapStateToProps(this,(state) => {
      return {
        block: Object.assign({}, state.workpad.tree[state.menu.blockId])
      }
    })
  }

  render() {
    return <div class='container m-4 w-1/4 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white' >
      <div class= 'block my-2 pl-2' onClick={ () => {
        this.setView(this.block,'title')
        this.closeMenu()
      }}> This is a title</div>
      <div  class= 'block my-2 pl-2 '  onClick={ () => {
        this.setView(this.block,'paragraph')
        this.closeMenu()
      }}>this is a paragraph</div>
    </div>
  }
}
