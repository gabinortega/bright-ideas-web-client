import { CodeSnippet } from './code-snippet';

export class CodeSnippetList implements ICodeSnippetList {
  snippets: CodeSnippet[] = [];
  dbVersion = '';
}

export interface ICodeSnippetList {
  snippets: CodeSnippet[];
  dbVersion: string;
}
