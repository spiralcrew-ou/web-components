import { Component, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'co-title1',
  styleUrl: 'co-title1.scss',
  shadow: false
})
export class COTitle1 {

    @Prop({mutable:true}) content: string
    @Prop() block_id: string
    @Event() activeBlock: EventEmitter

    activeFocusHandler = () => {
        this.activeBlock.emit(this.block_id)
    }
    render() {
        return <div 
            id={"CO-ELID-" + this.block_id} 
            class='mdc-typography--headline1' 
            contenteditable='true' 
            onClick={this.activeFocusHandler}>{this.content}</div>
    }
}
