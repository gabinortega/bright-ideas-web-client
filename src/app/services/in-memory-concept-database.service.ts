import { SyncService } from './sync.service';
import { Injectable } from '@angular/core';
import { Status } from '../shared/models';
import { Concept, ConceptType } from '../shared/concept';
import { ChildTag } from '../shared/tag';
import { ChildIdea } from '../shared/idea';
import { InMemoryDatabaseService } from './in-memory-database.service';
import { HistoricService } from './historic.service';

@Injectable({
  providedIn: 'root',
})
export class InMemoryConceptDatabaseService {
  private insertConcept(concept: Concept): Concept {
    concept.id = 0;
    concept.content = concept.content.trim();
    let currentDate = new Date().getTime();
    concept.created = currentDate;
    concept.lasUpdated = currentDate;
    let conceptDb = this.db.setConceptToIdMap(concept);
    this.db.insertConceptToSortByContentList(conceptDb);
    this.sync.propagateConceptChangesToAssociatedTags(conceptDb);
    return conceptDb;
  }

  private updateConcept(concept: Concept): Concept {
    concept.content = concept.content.trim();

    let existingConcept =
      concept.id > 0
        ? this.db.getConceptById(concept.id)!
        : this.db.getConceptQueryByContent(concept.content)[0];

    existingConcept.content = concept.content;
    existingConcept.isImportant = concept.isImportant;
    existingConcept.isUrgent = concept.isUrgent;
    existingConcept.priorityOrder = concept.priorityOrder;
    existingConcept.status = concept.status;
    existingConcept.type = concept.type;

    concept.tags.forEach((tag) => {
      if (existingConcept.tags.filter((x) => x.id === tag.id).length === 0) {
        existingConcept.tags.push(tag);
      }
    });

    concept.parents.forEach((parent) => {
      if (
        existingConcept.parents.filter((x) => x.id === parent.id).length === 0
      ) {
        existingConcept.parents.push(parent);
      }
    });

    this.history.saveConcept(existingConcept.id);
    existingConcept.lasUpdated = new Date().getTime();
    let result = this.db.setConceptToIdMap(existingConcept);
    this.db.updateConceptToSortByContentList(existingConcept);
    this.sync.propagateConceptChangesToAssociatedTags(existingConcept);
    return result;
  }

  saveConcept(concept: Concept, forceNew: boolean = false): Concept {
    concept.tags.forEach((tag) => {
      if (!this.db.flagTagExistById(tag.id)) {
        throw new Error(`All Tags must have id.`);
      }
    });

    concept.parents.forEach((idea) => {
      if (!this.db.flagIdeaExistById(idea.id)) {
        throw new Error(`All parent Ideas must have id.`);
      }
    });

    if (forceNew || !this._conceptExist(concept)) {
      return this.insertConcept(concept);
    }
    return this.updateConcept(concept);
  }

  getConcept(
    content: string,
    type: ConceptType = ConceptType.todo,
    tags: string = '',
    parents: string = ''
  ): Concept {
    let result = new Concept();
    result.content = content;
    result.isImportant = false;
    result.isUrgent = false;
    result.status = Status.none;
    result.type = type;
    result.tags = [];
    tags.split(',').forEach((tag) => {
      let childTag = new ChildTag();
      childTag.name = tag;
      result.tags.push(childTag);
    });

    parents.split(',').forEach((parent) => {
      let childParent = new ChildIdea();
      //childParent.id = parent;
      //result.tags.push(childParent);
    });

    return this.insertConcept(result);
  }

  removeParentRelationship(concept: Concept, parentId: number): Concept {
    if (!this._conceptExist(concept)) {
      return concept;
    }

    let existingConcept = this.db.getConceptById(concept.id);
    let parentList = existingConcept.parents.filter((x) => x.id === parentId);

    if (parentList.length < 1) {
      console.log(`Nothing to remove. No parent with id ${parentId}`);
      return existingConcept;
    }

    existingConcept.parents = existingConcept.parents.filter(
      (x) => x.id !== parentId
    );

    this.history.saveConcept(existingConcept.id);
    existingConcept.lasUpdated = new Date().getTime();
    let result = this.db.setConceptToIdMap(existingConcept);
    this.db.updateConceptToSortByContentList(existingConcept);

    return result;
  }

  removeTagRelationship(concept: Concept, tagId: number): Concept {
    if (!this._conceptExist(concept)) {
      return concept;
    }

    let existingConcept = this.db.getConceptById(concept.id);

    let resultList = existingConcept.tags.filter((x) => x.id === tagId);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No Tag relationship with id ${tagId}`);
      return existingConcept;
    }

    existingConcept.tags = existingConcept.tags.filter((x) => x.id !== tagId);

    this.history.saveConcept(existingConcept.id);
    existingConcept.lasUpdated = new Date().getTime();
    let result = this.db.setConceptToIdMap(existingConcept);
    this.db.updateConceptToSortByContentList(existingConcept);

    return result;
  }

  _conceptExist(concept: Concept): boolean {
    if (concept.id > 0) {
      if (this.db.flagConceptExistById(concept.id)) {
        return true;
      }

      throw new Error(`A Concept with id ${concept.id} does not exist.`);
    }

    return this.db.flagConceptExistByContent(concept.content);
  }

  removeConcept(concept: Concept): void {
    if (!this._conceptExist(concept)) {
      return;
    }

    this.db.deleteConceptFromMapId(concept);
    this.db.deleteConceptFromMapContent(concept);
  }

  constructor(
    private db: InMemoryDatabaseService,
    private sync: SyncService,
    private history: HistoricService
  ) {}
}
