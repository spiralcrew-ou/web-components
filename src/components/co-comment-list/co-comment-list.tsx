import { Component} from '@stencil/core';

@Component({
  tag: 'co-comment-list',
  styleUrl: 'co-comment-list.scss'
})



export class CommentList {
 render() {
    return <div>
        <header>
            <button class="mdc-icon-button material-icons">close</button>
            
            <button class="mdc-icon-button material-icons mdc-layout-grid--align-right">search</button>
          
            
        </header>
        <div class="mdc-tab-bar" role="tablist">
            <div class="mdc-tab-scroller">
                <div class="mdc-tab-scroller__scroll-area">
                <div class="mdc-tab-scroller__scroll-content">
                    <button class="mdc-tab mdc-tab--active" role="tab" aria-selected="true" tabindex="0">
                    <span class="mdc-tab__content">
                        <span class="mdc-tab__text-label">This context</span>
                    </span>
                    <span class="mdc-tab-indicator mdc-tab-indicator--active">
                        <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                    </span>
                    <span class="mdc-tab__ripple">
                     </span>
                    </button>
                </div>
                <div class="mdc-tab-scroller__scroll-content">
                    <button class="mdc-tab mdc-tab--active" role="tab" aria-selected="true" tabindex="0">
                    <span class="mdc-tab__content">
                        <span class="mdc-tab__text-label">ALL</span>
                    </span>
                  
                    </button>
                </div>
                <div class="mdc-tab-scroller__scroll-content">
                    <button class="mdc-tab mdc-tab--active" role="tab" aria-selected="true" tabindex="0">
                    <span class="mdc-tab__content">
                        <span class="mdc-tab__text-label">@ ME</span>
                    </span>
                   
                    </button>
                </div>
                </div>
            </div>
           
        </div>
         <co-comment-card></co-comment-card>
        <button class="mdc-fab app-fab--absolute" aria-label="Add">
        <span class="mdc-fab__icon material-icons">add</span>
        </button>

       
        
        
    </div>;
  }
}
