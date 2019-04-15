import { Component,Prop, State } from '@stencil/core';
import { Store } from '@stencil/redux';

@Component({
  tag: 'co-notification-badge',
  styleUrl: 'co-notification-badge.css',
  shadow: false
})
export class CONotificationBadge {
 
  @Prop({ context: 'store' }) store: Store;
  //@State() qty_new_notifications: number;
  @State() qty_new_notifications: number

  componentWillLoad = () => {
    this.store.mapStateToProps(this, (state) => {
   
    return {
      qty_new_notifications : state.notifications.messages.length
    }
  });

  }

  render() {
    return (<div>
      {this.qty_new_notifications===0 ? <i class="material-icons md-24">notifications_none</i> : <i class="material-icons md-24">notifications_active</i>}
    </div>);
  }
}
