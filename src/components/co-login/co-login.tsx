import {Component} from '@stencil/core';

@Component({
    tag: 'co-login',
    styleUrl: 'co-login.scss',
    shadow: true
  })
export class TextNodeElement {

    render() {
        return (<div class='uppercase'>Este es el login</div>)
    }
}