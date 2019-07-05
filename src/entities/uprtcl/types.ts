export interface Text {
  text: string;
}

export interface Node {
  links: string[];
}

export interface TextNode extends Text, Node {}

export interface DocumentNode extends TextNode {
  type: string;
}
