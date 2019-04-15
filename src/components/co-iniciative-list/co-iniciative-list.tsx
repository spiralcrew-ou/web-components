import { Component, State, Prop } from '@stencil/core';
import { Store } from '@stencil/redux';

@Component({
  tag: 'co-iniciative-list',
  styleUrl: 'co-iniciative-list.scss',
  //shadow: true
})
export class COIniciativeList {
  @Prop({ context: 'store' }) store: Store;
  @State() iniciatives: Array<Object> = [];
  @Prop() onlyMine: boolean = true;
  @Prop() sharedWithMe: boolean = false;
  @Prop() funcNewIniciative: Object;

  componentWillLoad() {
    this.store.mapStateToProps(this, (state) => {
      this.iniciatives = state.iniciatives.list
      return {
        iniciatives: state.iniciatives.list
      }
    })
  }

  newIniciative() {
    let executor = this.funcNewIniciative as Function
    executor()
  }

  prueba() {
    let comp = document.querySelector('co-app')

    const query = {
      query: `
       {
        iniciatives{
          iniciativeId,
          name,
          urlLogo,
          summary,
          owner {
            displayName
          }
        }
      }
    `}

    fetch('http://192.168.0.193:4000', {
      method: 'POST',
      body: JSON.stringify(query),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json().
        then(result => {
          result.data.iniciatives.forEach(i => {
            comp.newIniciative({
              iniciativeId: i.iniciativeId,
              name: i.name,
              summary: i.summary,
              visibility: i.visibility,
              fav: false,
              colaborators: [],
              createdAt: '',
              urlLogo: i.urlLogo,
              author: {
                name: i.owner.displayName
              }
            })
          })
        }))


    /*
    let comp = document.querySelector('co-app')
    comp.newIniciative({
      iniciativeId: '001',
      name: 'Hospital de Niños Garrahm',
      summary: 'Crear portal para paciente',
      visibility: 'PUBLIC',
      fav: false,
      colaborators: [],
      createdAt: '',
      urlLogo: 'http://www.eltucumano.com/fotos/cache/notas/2018/04/28/818x460_180428161835_80962.jpg',
      author: {
        name: 'Leonardo G. Leenen',
        email: 'leonardo@flicktrip.com',

      }
    })

    comp.newIniciative({
      iniciativeId: '002',
      name: 'Hospital22 de Niños Garrahm',
      summary: 'Crear portal para paciente',
      visibility: 'PUBLIC',
      fav: false,
      colaborators: [],
      createdAt: '',
      urlLogo: 'http://www.eltucumano.com/fotos/cache/notas/2018/04/28/818x460_180428161835_80962.jpg',
      author: {
        name: 'Leonardo G. Leenen',
        email: 'leonardo@flicktrip.com',

      }
    })*/


  }

  renderEmpty() {
    return (
      <content class='co-container' >
        <i class="material-icons md-180">devices_other</i>
        <h1 class='mdc-typography--headline6'> No existe ninguna iniciativa dentro de su entorno de trabajo.</h1>        
      </content>
    );
  }

  render() {
    if (this.iniciatives.length == 0) {
      return (this.renderEmpty())
    } else {
      return (
        <div class='mdc-layout-grid'>
          <div class='mdc-layout-grid__inner'>
            {this.iniciatives.map(i => {
              let { urlLogo, author, name, summary, iniciativeId, fav }: any = i
              return (
                <div class='mdc-layout-grid__cell'>
                  <co-iniciative-card
                    iniciative-id={iniciativeId}
                    author={author.displayName}
                    name={name}
                    fav={fav}
                    summary={summary}
                    url-background={urlLogo}></co-iniciative-card>
                </div>
              )
            })}
          </div>
        </div>)
    }
  }

}
