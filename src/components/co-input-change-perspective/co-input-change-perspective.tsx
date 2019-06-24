import { Component, State, Event, EventEmitter } from '@stencil/core';


@Component({
    tag: 'co-input-change-perspective',
    styleUrl: 'co-input-change-perspective.scss',
    shadow: true
})
export class COInputChangePerspective {

    @State() show: boolean = true
    @State() message: string
    @State() providerSelected: string 

    @Event({eventName: 'showInputChangePerspective',bubbles:true}) showInputChangePerspective: EventEmitter

    handleMessage(event) {
        this.message = event.target.value
    }

    handleProviderSelected(event) { 
        this.providerSelected = event.target.value
    }

    commit() {
        this.showInputChangePerspective.emit(false)
    }

    
    renderInput() {
        return <div class='container m-4 w-1/2 h-1/2 border-2 shadow-md p-2 rounded-lg font-thin z-10 fixed bg-white form text-gray-800 text-sm  '>
            <h2 class='text-3xl m-2'>Change Perspective</h2>
            <content>
                <input 
                    value={this.message}
                    onChange={event => this.handleMessage(event)}
                    class='ml-2 px-2 w-11/12 my-2 py-2 border-gray-600 border-b' 
                    placeholder='Please, drop a message'>
                </input>
            </content>
            <footer class='flex text-red-700 justify-end'>
                <button class='uppercase m-2 font-thin object-none ' onClick={() => this.showInputChangePerspective.emit(false)}>Cancel</button>
                <button class='uppercase m-2 font-thin object-none '>Accept</button>
            </footer>
        </div>
    }

    render = () => this.renderInput()

}
