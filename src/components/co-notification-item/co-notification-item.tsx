import { Component, Prop, State } from '@stencil/core';
import moment from 'moment';
import { Store, Action } from '@stencil/redux';


const lanza = () => {
    return dispatch => {
        console.log('se ejectua')
        dispatch({ type: 'PRUEBA', data: 'prueba' })
    }
}



@Component({
    tag: 'co-notification-item',
    styleUrl: 'co-notification-item.css',
    //shadow: true
})
export class CONotificationItem {

    @Prop({ context: 'store' }) store: Store;

    @Prop() title: string;
    @Prop() content: string;
    @State() author: string;
    @Prop() status: string;
    @Prop() avatarURL: string;
    @Prop() url: string;
    @Prop() date: string

    lanza: Action


    componentWillLoad = () => {
        this.store.mapStateToProps(this, (state) => {

            /*
            this.author = state.loggedUser.display
            return {
                vaAutor: state.loggedUser.display
            }*/
            this.author = state.loggedUser.display
            console.dir(state)
            return {
                
            }
        });

        
        this.store.mapDispatchToProps(this, {
            lanza
        })

        

        
    }

    render() {
        return (
            <conteiner-component style={this.status === 'READED' ? { background: "#f1f1f1" } : {}}>
                <img src={this.url} />

                <div >
                    <title-component>
                        {this.title}
                    </title-component>
                    <content-component>
                        {this.content}
                    </content-component>
                    <date-component style={this.status === 'READED' ? { color: "#E5361D" } : {}} >
                        <user-component>
                            {this.author}
                        </user-component>
                        {this.date}
                        {moment(new Date()).subtract(4, 'days').calendar()}
                    </date-component>
                    <button onClick={e =>{
                        console.dir(e)
                        this.lanza()
                    }}> Prueba </button>
                   
                </div>
            </conteiner-component>);
    }
}
