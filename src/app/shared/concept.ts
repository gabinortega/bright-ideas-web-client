import { ChildTag, Tag } from './tag';
import { Status } from './models';
import { ChildIdea } from './idea';

export class Concept {
  id: number = 0;
  content: string = '';
  type: ConceptType = ConceptType.info;
  tags: ChildTag[] = [];
  parents: ChildIdea[] = [];
  status: Status = Status.none;
  priorityOrder: number = 0;
  isImportant: boolean = false;
  isUrgent: boolean = false;
  created: number = 0;
  lasUpdated: number = 0;

  constructor(
    content: string = '',
    type: ConceptType = ConceptType.info,
    tags: string[] = []
  ) {
    this.content = content;
    this.type = type;
    if (tags && tags.length) {
      tags.forEach((tag: string) => {
        this.tags.push(new Tag(tag));
      });
    }
  }
}

export enum ConceptType {
  'image' = 100,
  'info' = 101,
  'description' = 102,
  'todo' = 103,
  'question' = 104,
  'language' = 105,
  'code' = 106,
  'link' = 107,
  'summary' = 108,
  'priority' = 109,
  'status' = 110,
}

export class ChildConcept {
  id: number = 0;
  content: string = '';
  type: ConceptType = ConceptType.info;
}
