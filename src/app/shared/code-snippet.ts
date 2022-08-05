import { ITag } from './itag';

export class CodeSnippet implements ICodeSnippet {
  id = 0;
  jsonData = '';
  rawTags = '';
  type = 0;
  priority = 0;
  status = 0;
  tags = [];
  summary = '';
  description = '';
  language = '';
  code = '';
}

export interface ICodeSnippet {
  // extends Partial<IBaseSnippet>
  id: number;
  jsonData: string;
  rawTags: string;
  type: number;
  priority: number;
  tags: string[];
  summary: string;
  description: string;
  status: number;
  // extends Partial<IBaseSnippet>

  language: string;
  code: string;
}

export class BaseSnippet implements IBaseSnippet {
  id = 0;
  jsonData = '';
  rawTags = '';
  type = 0;
  priority = 0;
  status = 0;

  tags: ITag[] = [];
  summary = '';
  description = '';
}

export interface IBaseSnippet {
  // extends Partial<ISnippetDb>
  id: number;
  jsonData: string;
  rawTags: string;
  type: number;
  priority: number;
  status: number;
  // extends Partial<ISnippetDb>

  tags: ITag[];
  summary: string;
  description: string;
}

export class SnippetDb implements ISnippetDb {
  id = 0;
  jsonData = '';
  priority = 0;
  type = 0;
  status = 0;
  rawTags = '';
}

export interface ISnippetDb {
  id: number;
  jsonData: string;
  rawTags: string;
  type: number;
  priority: number;
  status: number;
}

export class SnippetType {
  id: number = 0;
  label: string = '';
  name: string = '';
  enable: boolean = true;
}

/*
export SnippetTypes = [] = [
  new SnippetType() {
    id: 0,
    label: 'To be Defined',
    name: 'tbd',
    enable: true,
  }, {
    id: 1,
    label: 'Reference information',
    name: 'info',
    enable: true,
  }, {
    id: 2,
    label: 'Dynamic',
    name: 'dynamic',
    enable: false,
  }, {
    id: 3,
    label: 'Task',
    name: 'todo',
    enable: true,
  }, {
    id: 4,
    label: 'Question',
    name: 'question',
    enable: true,
  }, {
    id: 5,
    label: 'How to',
    name: 'howTo',
    enable: true,
  }, {
    id: 6,
    label: 'Code Snippet',
    name: 'code',
    enable: true,
  },
],
*/
