import { Component, Prop, State, Listen } from '@stencil/core';
import { MDCMenu } from '@material/menu';
import { uuidv4 } from '../../utils/utils';
import {fetchIniciative} from '../../actions';
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCDrawer} from "@material/drawer";


let menu = null
let toolbar = null


@Component({
  tag: 'co-editor',
  styleUrl: 'co-editor.scss',
  shadow: false
})
export class COEditor {

  @Prop() iniciativeId: string
  @Prop() documentId: string
  @Prop() revision: string = 'draft'
  @State() blocks = []
  @State() blockActiveId: string
  @State() currentBlock: any

  fixMenu = () => {
    const menu = document.querySelector('.context_menu')
    const _left = window.innerWidth - menu.getBoundingClientRect().width - 50
    menu.setAttribute("style", "left: " + _left + "px");
  }
  handleDrawer =() =>{
    const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
    const topAppBar = MDCTopAppBar.attachTo(document.getElementById('app-bar'));
    topAppBar.setScrollTarget(document.getElementById('main-content'));
    topAppBar.listen('MDCTopAppBar:nav', () => {
    drawer.open = !drawer.open;
    });
  }


  handleOpen = () => {
    menu.hoistMenuToBody()
    const el = document.querySelector('.context_menu')
    const _x = window.innerWidth - el.getBoundingClientRect().width - 40
    const _y = window.innerHeight - el.getBoundingClientRect().height - 90
    menu.setAbsolutePosition(_x, _y)
    menu.open = !menu.open
  }

  handleOpenToolbar = (e,block) => {
    console.log(e.x, e.y)
    console.log(toolbar.open)
    this.currentBlock = block
    toolbar.hoistMenuToBody()
    toolbar.setAbsolutePosition(e.x, e.y)
    toolbar.open = !toolbar.open
  }

  changeFormat = (newType) => {
    const dummy = Object.assign([], this.blocks)
    const index = this.blocks.findIndex(e => e.id === this.currentBlock.id)
    dummy[index].type = newType
    this.blocks = dummy
  }

  allowDrop = ev => {
    ev.preventDefault();
    // console.log(ev.target.id)
  }

  drag = (ev) =>  {
    ev.dataTransfer.setData("text", ev.target.id)
    // console.log(ev)
  }

  
  drop = ev =>  {
    ev.preventDefault();
   
    const dummy = Object.assign([], this.blocks.filter( e => e.id !=this.currentBlock.id))
    const index = this.blocks.findIndex(e => e.id === ev.target.attributes.id.nodeValue)
    dummy.splice(index,0,this.currentBlock)
    this.blocks = dummy 
   }

  save = () => {
    this.blocks.map(e => this.syncBlock(e.id))
  }

  

  componentWillLoad = () => {
    
    this.blocks = fetchIniciative().documents
    /*
    this.blocks = [{
      id: uuidv4(),
      type: 'co-title2',
      content: 'Washington D. C.'
    },
    
    {
      id: uuidv4(),
      type: 'co-paragraph',
      content: `Washington D. C. (/ˈwɑʃɪŋtən diˈsi/ en inglés), oficialmente el Distrito de Columbia (en inglés, District of Columbia), es la capital de Estados Unidos. Se administra como distrito federal, una entidad diferente a los cincuenta estados que componen dicha nación, y depende directamente del gobierno federal. El Distrito de Columbia fue fundado el 16 de julio de 1790, y en 1791 se oficializó, dentro del distrito, una nueva ciudad denominada Washington, al este de la ya existente Georgetown. En 1871 se unificaron los gobiernos de estas dos ciudades y del resto de poblaciones del distrito en una sola entidad, D. C.`
    },
    {
      id: uuidv4(),
      type: 'co-paragraph',
      content: `Se localiza a orillas del río Potomac y está rodeada por los estados de Virginia al oeste, y de Maryland al norte, este y sur.`
    },
    {
      id: uuidv4(),
      type: 'co-paragraph',
      content: `La ciudad de Washington nació como una ciudad planificada, y fue desarrollada a finales del siglo XVIII para servir como la capital nacional permanente, después de que diversas localidades ostentaran dicha posición desde la independencia del país, en 1776; en tanto, el distrito federal fue formado para marcar la diferencia entre la capital nacional y los estados. La ciudad fue nombrada en honor a George Washington, el primer presidente de los Estados Unidos. El nombre del distrito, Columbia, es el nombre poético de Estados Unidos, en referencia a Cristóbal Colón (en inglés Christopher Columbus), primer explorador en llegar a América. La ciudad es llamada comúnmente Washington, the District (el Distrito) o simplemente D. C. En el siglo XIX también se la conoció como Ciudad Federal o Ciudad de Washington.`
    },
    {
      id: uuidv4(),
      type: 'co-subtitle1',
      content: 'Historia'
    },
    {
      id: uuidv4(),
      type: 'co-paragraph',
      content: `El Distrito de Columbia, fundado el 16 de julio de 1790, es un distrito federal, como especifica la Constitución de los Estados Unidos. El Congreso estadounidense tiene la máxima autoridad sobre el Distrito de Columbia, aunque éste haya delegado la autoridad, de manera considerable, al gobierno municipal. La zona en la que se sitúa el Distrito original salió del estado de Maryland, y la Mancomunidad de Virginia. Sin embargo, el área al sur del río Potomac (aproximadamente 100 km²) fue devuelta a Virginia en 1847 y ahora forma parte del Condado de Arlington y la ciudad de Alexandria. El resto de la superficie que conforma el área, ahora conocida como Distrito de Columbia, pertenecía a Maryland.`
     },
     {
      id: uuidv4(),
      type: 'co-subtitle2',
      content: 'Planificacion'
    },
    {
      id: uuidv4(),
      type: 'co-paragraph',
      content: `Thomas Jefferson recibió a James Madison y a Alexander Hamilton para celebrar una cena en la que acordaron que la capital del nuevo país debía estar en uno de los llamados «estados sureños». Esta decisión fue tomada a causa de las deudas de la Guerra de la Independencia6​ (los estados del sur en gran parte habían pagado sus deudas de guerra; la colectivización de la deuda era una ventaja para los estados del norte, por lo que la capital se llevó al sur). La distribución de la ciudad fue llevada a cabo en su mayor parte por el arquitecto francés Pierre Charles L'Enfant,7​ un ingeniero y urbanista que en un primer momento llegó a las colonias americanas británicas como ingeniero militar del marqués de La Fayette. L'Enfant preparó un plan básico para Washington D. C. en 1791; edificando la ciudad en el estilo Barroco, que era el estilo dominante en muchas de las ciudades que se planificaron en la época en Europa y en Estados Unidos. `
    },
    ]*/
  }

  syncBlock = blockId => {
    console.log('CO-ELID-' + blockId)
    const dummy = Object.assign([], this.blocks)
    const index = this.blocks.findIndex(e => e.id ===  blockId)
    dummy[index].content= document.getElementById('CO-ELID-' + blockId).innerHTML
    this.blocks = dummy
  }

  @Listen('keydown')
  handleKeyDown(ev: KeyboardEvent) {
    console.log(ev.key)
    const newLine = {
      id: uuidv4(),
      type: 'co-paragraph',
      content: ''
    }

    if (ev.key === 'Enter') {
      const dummy = Object.assign([], this.blocks)
      const index = this.blocks.findIndex(e => e.id === this.blockActiveId)
      dummy[index].content.replace(/\n/g, '')
      dummy.splice(index + 1, 0, newLine)
      this.blocks = dummy
      // ev.preventDefault()
    }

    if ((ev.key === 'Backspace') && (document.getElementById('CO-ELID-' + this.blockActiveId).innerHTML.length <= 1)) {
      const dummy = Object.assign([], this.blocks)
      this.blocks = dummy.filter(e => e.id != this.blockActiveId)
    }
  }

  @Listen('activeBlock')
  handleBlockActive(ev: CustomEvent) {

    this.blockActiveId = ev.detail
    // this.syncBlock(this.blockActiveId)
  }

  
  componentDidLoad = () => {
    menu = new MDCMenu(document.querySelector('.context_menu'))
    toolbar = new MDCMenu(document.querySelector('.editorToolbar'))
  }
  

  renderToolbar = () => {
    return <div class="editorToolbar mdc-menu mdc-menu-surface">
      <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
        <li class="mdc-list-item" role="menuitem" onClick={ () => this.changeFormat('co-title1')}>
          <i class="material-icons mdc-list-item__graphic" aria-hidden="true">format_size</i>
          <span class="mdc-list-item__text">Title1</span>
        </li>
        <li class="mdc-list-item" role="menuitem" onClick={ () => this.changeFormat('co-title2')}>
          <i class="material-icons mdc-list-item__graphic" aria-hidden="true">format_size</i>
          <span class="mdc-list-item__text">Title2</span>
        </li>
        <li class="mdc-list-item" role="menuitem" onClick={ () => this.changeFormat('co-subtitle1')}>
          <i class="material-icons mdc-list-item__graphic" aria-hidden="true">format_size</i>
          <span class="mdc-list-item__text">Subtitle1</span>
        </li>
        <li class="mdc-list-item" role="menuitem" onClick={ () => this.changeFormat('co-subtitle2')}>
          <i class="material-icons mdc-list-item__graphic" aria-hidden="true">format_size</i>
          <span class="mdc-list-item__text">Subtitle2</span>
        </li>
        <li class="mdc-list-item" role="menuitem" onClick={ () => this.changeFormat('co-paragraph')}>
          <i class="material-icons mdc-list-item__graphic" aria-hidden="true">format_textdirection_l_to_r</i>
          <span class="mdc-list-item__text">Paragraph</span>
        </li>
      </ul>
    </div>
  }

  renderBlock = block => {
    switch (block.type) {
      case 'co-title1':
        return <co-title1 block_id={block.id} content={block.content}></co-title1>
      case 'co-title2':
        return <co-title2 block_id={block.id} content={block.content}></co-title2>
      case 'co-subtitle1':
        return <co-subtitle1 block_id={block.id} content={block.content}></co-subtitle1>
      case 'co-subtitle2':
        return <co-subtitle2 block_id={block.id} content={block.content}></co-subtitle2>
      case 'co-paragraph':
        return <co-paragraph block_id={block.id} content={block.content}></co-paragraph>
      default:
        return <co-paragraph block_id={block.id} content={block.content}></co-paragraph>

    }

  }

  render() {

    // <div class='block' draggable={true} onDragOver={event => this.allowDrop(event)} onDrop={event => this.drop(event)} onDragStart = {this.drag} onMouseDown={() => this.currentBlock = block}></div>
    return (
      <div>
        <aside class="mdc-drawer mdc-drawer--dismissible mdc-top-app-bar--fixed-adjust">
        <div class="mdc-drawer__header">
            <h3 class="mdc-drawer__title">Comments</h3>
            
          </div>
            <div class="mdc-drawer__content">
              <div class="mdc-list">
                <span>
                <i class="material-icons mdc-list-item__graphic" aria-hidden="true">info</i>  
                </span>
                <span>
                <i class="material-icons mdc-list-item__graphic" aria-hidden="true">comment</i>  
                </span>
                
              </div>

              <div class="mdc-card demo-card demo-ui-control">
                <div class="mdc-card__primary-action demo-card__primary-action" tabindex="0">
                  <div class="demo-card__primary">
                  <h3 class=" mdc-typography mdc-typography--caption">by Leonardo G. Leenen</h3>
                    <p class=" mdc-typography mdc-typography--body2">Imagen de satélite mostrando la deforestación en una región del Mato Grosso, el estado brasileño que sufre las pérdidas recientes más graves. La deforestación en Brasil es uno de los grandes problemas ecológicos que el país enfrenta en la actualidad. Según el científico Ronaldo Hernández,</p>
                   <span class=" mdc-typography mdc-typography--caption">24 de abril</span>
                  </div>
                </div>
                <div class="mdc-card__actions">
                  <div class="mdc-card__action-icons">
                  <button class="mdc-icon-button material-icons mdc-card__action mdc-card__action--icon--unbounded" >comment</button>
                  </div>
                </div>
              </div>
              
              
            </div>

          </aside>

          <div class="mdc-drawer-app-content mdc-top-app-bar--fixed-adjust ">
            <main class="main-content" id="main-content">
            {this.blocks.map(block => (
                  <div class="block">
                    <button class="mdc-icon-button material-icons ghost" onClick={ e => this.handleOpenToolbar(e,block)}>menu</button>
                    {this.renderBlock(block)}
                    <button class="mdc-icon-button material-icons ghost"   onClick={this.handleDrawer} id="app-bar">
                      <a  class="demo-menu material-icons mdc-top-app-bar__navigation-icon">menu</a>
                    </button>
                  </div>
            ))}

                

                {this.renderToolbar()}
                <button id="menu-button" class="mdc-fab app-fab--absolute" aria-label="Favorite" onClick={this.handleOpen}>
                  <span class="mdc-fab__icon material-icons" >create</span>
                </button>

                <div class="context_menu mdc-menu mdc-menu-surface ">
                  <ul class="mdc-list mdc-typography--body1" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1" >
                    <li class="mdc-list-item" role="menuitem">
                      <i class="material-icons mdc-list-item__graphic" aria-hidden="true">call_split</i>
                      <span class="mdc-list-item__text">New Version</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem">
                      <i class="material-icons mdc-list-item__graphic" aria-hidden="true">merge_type</i>
                      <span class="mdc-list-item__text">Merge</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem" onClick={this.save}>
                      <i class="material-icons mdc-list-item__graphic" aria-hidden="true">done</i>
                      <span class="mdc-list-item__text">Save</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem">
                      <i class="material-icons mdc-list-item__graphic" aria-hidden="true">share</i>
                      <span class="mdc-list-item__text">Share</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem">
                      <i class="material-icons mdc-list-item__graphic" aria-hidden="true">tune</i>
                      <span class="mdc-list-item__text">Settings</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem">
                      <i class="material-icons mdc-list-item__graphic" aria-hidden="true">swap_vert</i>
                      <span class="mdc-list-item__text">Change Perspective</span>
                    </li>
                    <li class="mdc-list-item" role="menuitem">
                      <i class="material-icons mdc-list-item__graphic" aria-hidden="true">publish</i>
                      <span class="mdc-list-item__text">Publish</span>
                    </li>
                  </ul>
                </div>
            </main>
          </div>
      
         

      </div>)
  }
}
