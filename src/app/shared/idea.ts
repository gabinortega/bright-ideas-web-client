import { Concept } from './concept';
import { Status } from './models';
import { ChildTag } from './tag';

export class Idea {
  id: number = 0;
  type: IdeaType = IdeaType.info;
  parents: ChildIdea[] = [];
  concepts: Concept[] = [];
  tags: ChildTag[] = [];
  status: Status = Status.none;
  priorityOrder: number = 0;
  isImportant: boolean = false;
  isUrgent: boolean = false;
  created: number = 0;
  lasUpdated: number = 0;

  get topic(): string {
    return this._topic;
  }

  public setTopic(newTopic: string): void {
    this._topic = newTopic;
  }

  constructor(private _topic: string) {}
}

export class ChildIdea {
  constructor(public id: number = 0, public topic = '') {}
}

export enum IdeaType {
  'tbd' = 0,
  'toBeDefined' = 0,
  'info' = 1,
  'dynamic' = 2,
  'todo' = 3,
  'question' = 4,
  'howTo' = 5,
  'code' = 6,
  'gtdTask' = 7,
  'digest' = 8,
  'checklist' = 9,
}
