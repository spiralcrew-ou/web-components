import { Component, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'co-subtitle2',
  styleUrl: 'co-subtitle2.scss',
  shadow: true
})
export class COSubTitle2 {

    @Prop({mutable:true}) content: string
    @Prop() block_id: string
    @Event() activeBlock: EventEmitter

    activeFocusHandler = () => {
        this.activeBlock.emit(this.block_id)
    }
    render() {
        return <div class='mdc-typography--subtitle2' contenteditable='true' onClick={this.activeFocusHandler}>{this.content}</div>
    }
}
