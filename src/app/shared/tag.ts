import { ChildConcept } from './concept';
import { ChildIdea } from './idea';

export class Tag {
  id: number = 0;
  ideas: ChildIdea[] = [];
  concepts: ChildConcept[] = [];
  label: string = '';
  keywords: string[] = [];
  private _name: string;

  get name(): string {
    return this._name;
  }

  public setName(newTagName: string): void {
    this._name = newTagName.trim();
  }

  constructor(tagName: string) {
    this._name = tagName.trim();
  }
  priorityOrder: number = 0;
  isImportant: boolean = false;
  isUrgent: boolean = false;
  created: number = 0;
  lasUpdated: number = 0;
}

export class ChildTag {
  id: number = 0;
  name: string = '';
}

export class TagKeywords {
  keyword: string = '';
  tag: string = '';
}
