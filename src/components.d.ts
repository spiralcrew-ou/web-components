/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';




export namespace Components {

  interface CoEditor {}
  interface CoEditorAttributes extends StencilHTMLAttributes {}

  interface TextBlock {
    'text': string;
  }
  interface TextBlockAttributes extends StencilHTMLAttributes {
    'onContent-changed'?: (event: CustomEvent) => void;
    'text'?: string;
  }

  interface TextNode {
    'createCommit': () => Promise<any[]>;
    'createPerspective': (serviceProvider: string, name: string) => Promise<void>;
    'isRootNode': boolean;
    'perspectiveId': string;
  }
  interface TextNodeAttributes extends StencilHTMLAttributes {
    'isRootNode'?: boolean;
    'onCreateSibling'?: (event: CustomEvent) => void;
    'perspectiveId'?: string;
  }

  interface TextBlock {
    'text': string;
  }
  interface TextBlockAttributes extends StencilHTMLAttributes {
    'onContent-changed'?: (event: CustomEvent) => void;
    'text'?: string;
  }
}

declare global {
  interface StencilElementInterfaces {
    'CoEditor': Components.CoEditor;
    'TextBlock': Components.TextBlock;
    'TextNode': Components.TextNode;
    'TextBlock': Components.TextBlock;
  }

  interface StencilIntrinsicElements {
    'co-editor': Components.CoEditorAttributes;
    'text-block': Components.TextBlockAttributes;
    'text-node': Components.TextNodeAttributes;
    'text-block': Components.TextBlockAttributes;
  }


  interface HTMLCoEditorElement extends Components.CoEditor, HTMLStencilElement {}
  var HTMLCoEditorElement: {
    prototype: HTMLCoEditorElement;
    new (): HTMLCoEditorElement;
  };

  interface HTMLTextBlockElement extends Components.TextBlock, HTMLStencilElement {}
  var HTMLTextBlockElement: {
    prototype: HTMLTextBlockElement;
    new (): HTMLTextBlockElement;
  };

  interface HTMLTextNodeElement extends Components.TextNode, HTMLStencilElement {}
  var HTMLTextNodeElement: {
    prototype: HTMLTextNodeElement;
    new (): HTMLTextNodeElement;
  };

  interface HTMLTextBlockElement extends Components.TextBlock, HTMLStencilElement {}
  var HTMLTextBlockElement: {
    prototype: HTMLTextBlockElement;
    new (): HTMLTextBlockElement;
  };

  interface HTMLElementTagNameMap {
    'co-editor': HTMLCoEditorElement
    'text-block': HTMLTextBlockElement
    'text-node': HTMLTextNodeElement
    'text-block': HTMLTextBlockElement
  }

  interface ElementTagNameMap {
    'co-editor': HTMLCoEditorElement;
    'text-block': HTMLTextBlockElement;
    'text-node': HTMLTextNodeElement;
    'text-block': HTMLTextBlockElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}
