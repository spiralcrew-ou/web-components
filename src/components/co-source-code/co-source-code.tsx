import { Component, Element } from '@stencil/core';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';


@Component({
  tag: 'co-source-code',
  styleUrl: 'co-source-code.scss',
  shadow: true
})
export class COSourceCode {

  @Element() _element: HTMLElement;



  componentDidLoad() {
    hljs.registerLanguage('javascript', javascript);
    this._element.shadowRoot.querySelectorAll('pre code').forEach((block) => {

      hljs.highlightBlock(block);
    });
  }

  render() {

    return (<pre><code class="html">{`
        const var1 = new MyClass();
        `}</code></pre>)
  }
}