import { Component} from '@stencil/core';

@Component({
  tag: 'co-comment-card',
  styleUrl: 'co-comment-card.scss',
  shadow: true
})



export class CommentCard {
 render() {
    return <div>
        <div class="mdc-card demo-card demo-ui-control">
            <div class="mdc-card__primary-action " tabindex="0">
                <div class="avatar" ><img src=" https://pbs.twimg.com/profile_images/594370331013476352/3us0t8bB.jpg"/>
                </div>
                <div class="demo-card__primary">
                <h2 class="demo-card__title mdc-typography ">Leonardo G. Leenen</h2>
                <h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle2 date">30 apr. 2019 11:35 am</h3>
                <div class="demo-card__secondary mdc-typography ">Hola @Pepo, sería bueno poder tener tu opinión restpecto de este tema…</div>
                </div>
            </div>
         </div>
         <div class="mdc-card demo-card demo-ui-control">
            <div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">
            <div class="avatar" ><img src=" https://pbs.twimg.com/profile_images/594370331013476352/3us0t8bB.jpg"/>
                </div>
            <div class="demo-card__primary">
                <h2 class="demo-card__title mdc-typography ">Leonardo G. Leenen</h2>
                <h3 class="demo-card__subtitle mdc-typography mdc-typography--subtitle2 date">30 apr. 2019 11:35 am</h3>
                <div class="demo-card__secondary mdc-typography ">Hola @Pepo, sería bueno poder tener tu opinión restpecto de este tema…</div>
                </div>
            </div>
         </div>
    </div>;
  }
}
