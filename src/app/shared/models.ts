import { Concept } from './concept';
import { Idea } from './idea';
import { ChildTag, Tag } from './tag';

export class TagRelationships {
  ideas: Idea[] = [];
  concepts: Concept[] = [];
  tags: Tag[] = [];
}

export enum Status {
  'none' = 0,
  'do',
  'doing',
  'defer',
  'delegate',
  'done',
}

export class IdeaForCollectionsViewModel {
  id: number = 0;
  concepts: Concept[] = [];
  priority: number = 0;
  type: number = 0;
  status: number = 0;
  rawTags: string = '';
}

export class IdeaForIndividualViewModel {
  id: number = 0;
  concepts: Concept[] = [];
  priority: number = 0;
  type: number = 0;
  status: number = 0;
  tags: ChildTag[] = [];
}
