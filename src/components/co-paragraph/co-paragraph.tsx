import { Component, Prop, Event } from '@stencil/core';
import { EventEmitter } from 'events';

@Component({
    tag: 'co-paragraph',
    styleUrl: 'co-paragraph.scss',
    shadow: false
})
export class COParagraph {

    @Prop({ mutable: true }) content: string
    @Prop() block_id: string
    @Event() activeBlock: EventEmitter

    activeFocusHandler = () => {
        this.activeBlock.emit(this.block_id)
    }

    render() {
        return <div 
                    id={this.block_id} 
                    class='mdc-typography--body1 contextObject' 
                    contenteditable='true'
                    data-placeholder='Please write something here'
                    onClick={this.activeFocusHandler}>{this.content}</div>
    }
}
