import { Component, Prop, Element } from '@stencil/core';
import { Store, Action } from '@stencil/redux';
import {updateIniciativeFav} from  '../../actions.js';

@Component({
  tag: 'co-iniciative-card',
  styleUrl: 'co-iniciative-card.scss',
  //shadow: true
})
export class COIniciativeCard {

  @Prop({ context: 'store' }) store: Store;
  @Prop() cc: string;
  @Prop() urlBackground: string;
  @Prop() author: object;
  @Prop() name: string;
  @Prop() summary: string;
  @Prop() visibility: string;
  @Prop() iniciativeId: string; 
  @Prop({mutable: true}) fav: boolean; 
  
  @Element() el: HTMLElement;

  dispatchUpdateFav : Action 

  componentDidLoad = () => {
    let divLogoImage = this.el.querySelector('.my-card__media') as HTMLElement
    divLogoImage.style.setProperty('background-image', 'url(' + this.urlBackground + ')')
    divLogoImage.style.setProperty('background-size', '100%')
  }

  componentWillLoad = () => {


    this.store.mapDispatchToProps(this, {
      dispatchUpdateFav : updateIniciativeFav
    })

  }

  handleFav = () => {
    
    this.dispatchUpdateFav({
      iniciativeId: this.iniciativeId,
      fav: this.fav
    })
  }

  render() {
    return (
      <div class="mdc-card">
      
        <div class="mdc-card__primary-action " tabindex="0">
          <div class='card-header'>
            <h2 class="mdc-typograpy mdc-typography--headline6"> {this.name}</h2>
            <h3 class="mdc-typograpy mdc-typography--subtitle2" > Autor: {this.author}</h3>
          </div>
          <div class="my-card__media mdc-card__media mdc-card__media--16-9"></div>
          <div class=' card-secondary-text mdc-typography mdc-typography--body2'> {this.summary}  </div>
        </div>
        <div class="mdc-card__actions">
          <div class="mdc-card__action-icons">
            <button class="mdc-icon-button mdc-card__action mdc-card__action--icon--unbounded" onClick={this.handleFav} aria-pressed="false" aria-label="Add to favorites" title="Add to favorites">
              {this.fav ? <i class="material-icons mdc-icon-button__icon fav-selected">favorite</i> : <i class="material-icons mdc-icon-button__icon">favorite_border</i>}
            </button>
            <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" title="Share" data-mdc-ripple-is-unbounded="true">share</button>

          </div>
        </div>
      </div>
    );
  }
}
