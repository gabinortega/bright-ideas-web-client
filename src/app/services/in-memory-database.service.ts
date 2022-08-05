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
  public tagIdMap = new Map<number, Tag>();
  public tagNameMap = new Map<string, Tag>();

  public ideaIdMap = new Map<number, Idea>();
  public ideaTopicMap = new Map<string, Idea>();

  public conceptIdMap = new Map<number, Concept>();
  public conceptContentSort: Concept[] = [];

  public tagKeywords: TagKeywords[] = [];
  public tagHistory: Tag[] = [];
  public conceptHistory: Tag[] = [];
  public ideaHistory: Tag[] = [];

  public ideaLastId: number = 0;
  public conceptLastId: number = 0;
  public tagLastId: number = 0;

  _saveTag(tag: Tag) {
    if (tag.id === 0) {
      tag.id = this._getTagId();
    }
    this.tagIdMap.set(tag.id, tag);
    this.tagNameMap.set(tag.name, tag);
    return tag;
  }

  private _getTagId(): number {
    this.tagLastId = this.tagLastId + 1;
    return this.tagLastId;
  }

  _saveIdea(idea: Idea) {
    if (idea.id === 0) {
      idea.id = this._getIdeaId();
    }
    this.ideaIdMap.set(idea.id, idea);
    this.ideaTopicMap.set(idea.topic, idea);
    return idea;
  }

  private _getIdeaId(): number {
    this.ideaLastId = this.ideaLastId + 1;
    return this.ideaLastId;
  }

  _insertConcept(concept: Concept) {
    if (concept.id === 0) {
      concept.id = this._getConceptId();
    }
    concept.content = concept.content.trim(); // to sorted and found it quickly
    this.conceptIdMap.set(concept.id, concept);
    this.conceptContentSort.push(concept);
    return concept;
  }

  _updateConcept(newConcept: Concept) {
    this.conceptIdMap.set(newConcept.id, newConcept);
    let oldConcept = this.conceptContentSort.filter(
      (x) => (x.content = newConcept.content.trim())
    )[0];

    let index = this.conceptContentSort.indexOf(oldConcept);
    this.conceptContentSort.splice(index, 1, newConcept);
    return newConcept;
  }

  private _getConceptId(): number {
    this.conceptLastId = this.conceptLastId + 1;
    return this.conceptLastId;
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

    this.conceptLastId = 0;
    this.tagLastId = 0;
    this.ideaLastId = 0;
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
