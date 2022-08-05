import { InMemoryConceptDatabaseService } from './in-memory-concept-database.service';
import { InMemoryIdeaDatabaseService } from './in-memory-idea-database.service';
import { TagKeywords } from './../shared/tag';
import { Injectable } from '@angular/core';
import { Concept } from '../shared/concept';
import { Tag } from '../shared/tag';
import { Idea } from '../shared/idea';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDatabaseService {
  private tagIdMap = new Map<number, Tag>();
  private tagNameMap = new Map<string, Tag>();

  private ideaIdMap = new Map<number, Idea>();
  private ideaTopicMap = new Map<string, Idea>();

  private conceptIdMap = new Map<number, Concept>();
  private conceptContentSort: Concept[] = [];

  private tagKeywords: TagKeywords[] = [];
  private tagHistory: Tag[] = [];
  private conceptHistory: Tag[] = [];
  private ideaHistory: Tag[] = [];

  private _ideaLastId: number = 0;
  private _conceptLastId: number = 0;
  private _tagLastId: number = 0;

  public get ideaDbLength(): number {
    if (this.ideaIdMap.size !== this.ideaTopicMap.size) {
      throw new Error('ideaDb is out of sync');
    }

    return this.ideaIdMap.size;
  }

  public get conceptDbLength(): number {
    if (this.conceptIdMap.size !== this.conceptContentSort.length) {
      throw new Error('conceptDb is out of sync');
    }

    return this.conceptIdMap.size;
  }

  public get tagDbLength(): number {
    if (this.tagIdMap.size !== this.tagNameMap.size) {
      throw new Error('tagDb is out of sync');
    }

    return this.tagIdMap.size;
  }

  public setIdeaToIdMap(idea: Idea): Idea {
    if (!idea.id) {
      idea.id = this.getNextIdeaId();
    }
    if (!idea.topic.trim()) {
      throw new Error('Idea Topic must not be blank.');
    }
    this.ideaIdMap.set(idea.id, idea);
    return idea;
  }

  public setIdeaToNameMap(idea: Idea): Idea {
    if (!idea.id) {
      throw new Error('Idea Id must not be zero.');
    }
    if (!idea.topic.trim()) {
      throw new Error('Idea Topic must not be blank.');
    }
    this.ideaTopicMap.set(idea.topic, idea);
    return idea;
  }

  public setTagToIdMap(tag: Tag): Tag {
    if (tag.id === 0) {
      tag.id = this.getNextTagId();
    }
    if (!tag.name.trim()) {
      throw new Error('Tag name must not be blank.');
    }
    this.tagIdMap.set(tag.id, tag);
    return tag;
  }

  public setTagToNameMap(tag: Tag): Tag {
    if (tag.id === 0) {
      throw new Error('Tag Id must not be zero.');
    }
    if (!tag.name.trim()) {
      throw new Error('Tag name must not be blank.');
    }
    this.tagNameMap.set(tag.name, tag);
    return tag;
  }

  public setConceptToIdMap(concept: Concept): Concept {
    if (concept.id === 0) {
      concept.id = this.getNextConceptId();
    }
    if (!concept.content.trim()) {
      throw new Error('Concept content must not be blank.');
    }
    this.conceptIdMap.set(concept.id, concept);
    return concept;
  }

  public insertConceptToSortByContentList(concept: Concept): Concept {
    if (concept.id === 0) {
      throw new Error('Concept Id must not be zero.');
    }
    if (!concept.content.trim()) {
      throw new Error('Concept name must not be blank.');
    }
    this.conceptContentSort.push(concept);
    return concept;
  }

  public updateConceptToSortByContentList(concept: Concept): Concept {
    if (concept.id === 0) {
      throw new Error('Concept Id must not be zero.');
    }
    if (!concept.content.trim()) {
      throw new Error('Concept name must not be blank.');
    }

    let searchTerm = concept.content.trim();
    let queryResult = this.conceptContentSort.filter(
      (x) => x.content === searchTerm
    );

    if (queryResult.length > 0) {
      let oldConcept = this.conceptContentSort.filter(
        (x) => (x.content = concept.content.trim())
      )[0];

      let index = this.conceptContentSort.indexOf(oldConcept);
      this.conceptContentSort.splice(index, 1, concept);
    } else {
      this.conceptContentSort.push(concept);
    }

    return concept;
  }

  tagExistById(id: number): boolean {
    return this.tagIdMap.has(id);
  }

  tagExistByName(name: string): boolean {
    return this.tagNameMap.has(name);
  }

  ideaExistById(id: number): boolean {
    return this.ideaIdMap.has(id);
  }

  ideaExistByTopic(name: string): boolean {
    return this.ideaTopicMap.has(name);
  }

  conceptExistById(id: number): boolean {
    return this.conceptIdMap.has(id);
  }

  conceptExistByContent(content: string): boolean {
    let searchTerm = content.trim();
    return (
      this.conceptContentSort.filter((x) => x.content === searchTerm).length > 0
    );
  }

  getTagById(id: number): Tag {
    return this.tagIdMap.get(id)!;
  }

  getTagByName(name: string): Tag {
    return this.tagNameMap.get(name)!;
  }

  getIdeaById(id: number): Idea {
    return this.ideaIdMap.get(id)!;
  }

  getIdeaByTopic(name: string): Idea {
    return this.ideaTopicMap.get(name)!;
  }

  getConceptById(id: number): Concept {
    return this.conceptIdMap.get(id)!;
  }

  getConceptQueryByContent(content: string): Concept[] {
    let searchTerm = content.trim();
    return this.conceptContentSort.filter((x) => x.content === searchTerm)!;
  }

  private getNextTagId(): number {
    this._tagLastId = this._tagLastId + 1;
    return this._tagLastId;
  }

  private getNextIdeaId(): number {
    this._ideaLastId = this._ideaLastId + 1;
    return this._ideaLastId;
  }

  private getNextConceptId(): number {
    this._conceptLastId = this._conceptLastId + 1;
    return this._conceptLastId;
  }

  deleteTagFromMapId(tag: Tag): void {
    this.tagIdMap.delete(tag.id);
  }

  deleteTagFromMapName(tag: Tag): void {
    this.tagNameMap.delete(tag.name);
  }

  deleteIdeaFromMapId(idea: Idea): void {
    this.ideaIdMap.delete(idea.id);
  }

  deleteIdeaFromMapTopic(idea: Idea): void {
    this.ideaTopicMap.delete(idea.topic);
  }

  deleteConceptFromMapId(concept: Concept): void {
    this.conceptIdMap.delete(concept.id);
  }

  deleteConceptFromMapContent(concept: Concept): void {
    let conceptDb = this.conceptContentSort.filter(
      (x) => x.id === concept.id
    )[0];

    let index = this.conceptContentSort.indexOf(conceptDb);
    if (index > -1) {
      this.conceptContentSort.splice(index, 1);
    }
  }

  clearDatabase(): void {
    this.tagIdMap = new Map<number, Tag>();
    this.tagNameMap = new Map<string, Tag>();

    this.ideaIdMap = new Map<number, Idea>();
    this.ideaTopicMap = new Map<string, Idea>();

    this.conceptIdMap = new Map<number, Concept>();
    this.conceptContentSort = [];

    this.tagKeywords = [];
    this.tagHistory = [];
    this.conceptHistory = [];
    this.ideaHistory = [];

    this._conceptLastId = 0;
    this._tagLastId = 0;
    this._ideaLastId = 0;
  }

  constructor() {
    // todo:
    // 1. create an Idea with no concepts
    // 2. add it to the database
    // expected result:
    // the idea must have tags.
    // the idea must create return with an id.
    // 3. create a concept
    // 4. add it to the database
    // expected result:
    // the concept must have tags.
    // the concept must create return with an id.
    // 5. create a new Idea with concepts
    // 6. using a new topic, using no ids, the topic must not exist in the database
    // 7. save it to the database.
    // expected result:
    // the idea must look into the database for duplicated ideaIds get the ideaId if exits
    // if

    return;

    /*
    let idea01Id = this.ideaDb.getIdeaId();

    this.ideas = [
      {
        id: idea01Id,
        topic: 'Lista de comida para la casa',
        type: IdeaType.todo,
        status: Status.none,
        priorityOrder: 0,
        isImportant: false,
        isUrgent: false,
        tags: [
          {
            name: 'toBuy',
          },
        ],
        concepts: [
          this.getConcept(
            'Lista de comida para la casa',
            ConceptType.summary,
            'toBuy'
          ),
          {
            id: 2,
            content: 'Buy a new computer',
            type: ConceptType.todo,
            tags: [],
            parents: [],
            status: Status.do,
            priorityOrder: 0,
            isImportant: false,
            isUrgent: false,
          },
          {
            id: 3,
            content: 'Buy a lemon juice',
            type: ConceptType.todo,
            tags: [],
            parents: [],
            status: Status.do,
            priorityOrder: 0,
            isImportant: false,
            isUrgent: false,
          },
          {
            id: 4,
            content: 'Buy a orange juice',
            type: ConceptType.todo,
            tags: [],
            parents: [],
            status: Status.do,
            priorityOrder: 0,
            isImportant: false,
            isUrgent: false,
          },
        ],
      },
    ];

    this.tags = [
      {
        name: 'todo',
        ideas: [],
        concepts: [],
        label: 'todo',
      },
      {
        name: 'angular',
        ideas: [],
        concepts: [],
        label: '',
      },
      {
        name: 'npm package',
        ideas: [],
        concepts: [],
        label: '',
      },
      {
        name: 'toBuy',
        ideas: [],
        concepts: [],
        label: '',
      },
      {
        name: 'quotes',
        ideas: [],
        concepts: [],
        label: '',
      },
    ];

    this.concepts = [
      {
        id: 1,
        content: 'Lista de comida para la casa',
        type: ConceptType.summary,
        tags: [],
        parents: [],
        status: 0,
        priorityOrder: 0,
        isImportant: false,
        isUrgent: false,
      },
      {
        id: 2,
        content: 'Buy a new computer',
        type: ConceptType.todo,
        tags: [],
        parents: [],
        status: Status.do,
        priorityOrder: 0,
        isImportant: false,
        isUrgent: false,
      },
      {
        id: 3,
        content: 'Buy a lemon juice',
        type: ConceptType.todo,
        tags: [],
        parents: [],
        status: Status.do,
        priorityOrder: 0,
        isImportant: false,
        isUrgent: false,
      },
      {
        id: 4,
        content: 'Buy a orange juice',
        type: ConceptType.todo,
        tags: [],
        parents: [],
        status: Status.do,
        priorityOrder: 0,
        isImportant: false,
        isUrgent: false,
      },
      {
        id: 5,
        content: 'How to install an npm package',
        type: ConceptType.todo,
        tags: [
          {
            name: 'todo',
          },
          {
            name: 'npm package',
          },
        ],
        parents: [],
        status: Status.none,
        isImportant: false,
        isUrgent: false,
        priorityOrder: 0,
      },
      {
        id: 6,
        content: 'Practice makes perfect',
        type: ConceptType.info,
        tags: [
          {
            name: 'quotes',
          },
        ],
        parents: [],
        status: Status.none,
        isImportant: false,
        isUrgent: false,
        priorityOrder: 0,
      },
    ];
    */
  }
}
