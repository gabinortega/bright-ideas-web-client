import { Injectable } from '@angular/core';
import { Status } from '../shared/models';
import { Concept, ConceptType } from '../shared/concept';
import { ChildTag } from '../shared/tag';
import { ChildIdea } from '../shared/idea';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Injectable({
  providedIn: 'root',
})
export class InMemoryConceptDatabaseService {
  insertConcept(concept: Concept): Concept {
    concept.id = 0;
    concept.content = concept.content.trim();
    let currentDate = new Date().getTime();
    concept.created = currentDate;
    concept.lasUpdated = currentDate;
    let conceptDb = this.db.setConceptToIdMap(concept);
    this.db.insertConceptToSortByContentList(conceptDb);
    return conceptDb;
  }

  updateConcept(concept: Concept): Concept {
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

    existingConcept.type = concept.type;
    let currentDate = new Date().getTime();
    existingConcept.lasUpdated = currentDate;
    this.db.setConceptToIdMap(existingConcept);
    this.db.updateConceptToSortByContentList(existingConcept);
    return existingConcept;
  }

  saveConcept(concept: Concept, forceNew: boolean = false): Concept {
    concept.tags.forEach((tag) => {
      if (!this.db.tagExistById(tag.id)) {
        throw new Error(`All Tags must have id.`);
      }
    });

    concept.parents.forEach((idea) => {
      if (!this.db.ideaExistById(idea.id)) {
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

    let conceptDb = this.db.getConceptById(concept.id);

    let resultList = conceptDb.parents.filter((x) => x.id === parentId);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No parent with id ${parentId}`);
      return conceptDb;
    }

    conceptDb.parents = conceptDb.parents.filter((x) => x.id !== parentId);
    return conceptDb;
  }

  removeTagRelationship(concept: Concept, tagId: number): Concept {
    if (!this._conceptExist(concept)) {
      return concept;
    }

    let conceptDb = this.db.getConceptById(concept.id);

    let resultList = conceptDb.tags.filter((x) => x.id === tagId);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No Tag relationship with id ${tagId}`);
      return conceptDb;
    }

    conceptDb.tags = conceptDb.tags.filter((x) => x.id !== tagId);
    return conceptDb;
  }

  _conceptExist(concept: Concept): boolean {
    if (concept.id > 0) {
      if (this.db.conceptExistById(concept.id)) {
        return true;
      }

      throw new Error(`A Concept with id ${concept.id} does not exist.`);
    }

    if (this.db.conceptExistByContent(concept.content)) {
      return true;
    }

    return false;
  }

  removeConcept(concept: Concept): void {
    if (!this._conceptExist(concept)) {
      return;
    }

    this.db.deleteConceptFromMapId(concept);
    this.db.deleteConceptFromMapContent(concept);
  }

  constructor(private db: InMemoryDatabaseService) {}
}
