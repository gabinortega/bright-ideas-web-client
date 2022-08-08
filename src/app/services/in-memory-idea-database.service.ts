import { SyncService } from './sync.service';
import { ChildIdea } from './../shared/idea';
import { InMemoryDatabaseService } from './in-memory-database.service';
import { Injectable } from '@angular/core';
import { Idea } from '../shared/idea';
import { HistoricService } from './historic.service';

@Injectable({
  providedIn: 'root',
})
export class InMemoryIdeaDatabaseService {
  _ideaExist(idea: Idea): boolean {
    if (idea.id > 0) {
      if (this.db.flagIdeaExistById(idea.id)) {
        return true;
      }
      throw new Error(`An Idea with id ${idea.id} does not exist.`);
    }

    return this.db.flagIdeaExistByTopic(idea.topic);
  }

  insertIdea(idea: Idea): Idea {
    let currentDate = new Date().getTime();
    idea.created = currentDate;
    idea.lasUpdated = currentDate;

    let ideaDb = this.db.setIdeaToIdMap(idea);
    this.db.setIdeaToTopicMap(ideaDb);
    this.sync.propagateIdeaChangesToAssociatedObjects(idea);
    return ideaDb;
  }

  updateIdea(idea: Idea): Idea {
    let existingIdea =
      idea.id > 0
        ? this.db.getIdeaById(idea.id)!
        : this.db.getIdeaByTopic(idea.topic);

    existingIdea.isImportant = idea.isImportant;
    existingIdea.isUrgent = idea.isUrgent;
    existingIdea.priorityOrder = idea.priorityOrder;
    existingIdea.status = idea.status;
    //existingIdea.topic = idea.topic; not here
    existingIdea.type = idea.type;

    idea.parents.forEach((parent) => {
      if (existingIdea.parents.filter((x) => x.id === parent.id).length === 0) {
        existingIdea.parents.push(parent);
      }
    });

    idea.concepts.forEach((childConcept) => {
      if (
        existingIdea.concepts.filter((x) => x.id === childConcept.id).length ===
        0
      ) {
        existingIdea.concepts.push(childConcept);
      }
    });

    idea.tags.forEach((tag) => {
      if (existingIdea.tags.filter((x) => x.id === tag.id).length === 0) {
        existingIdea.tags.push(tag);
      }
    });

    //this.updateChildTags(existingIdea);

    this.history.saveIdea(existingIdea.id);
    let currentDate = new Date().getTime();
    // existingIdea.created is not going to be updated here.

    existingIdea.lasUpdated = currentDate;
    this.db.setIdeaToIdMap(existingIdea);
    this.db.setIdeaToTopicMap(existingIdea);
    this.sync.propagateIdeaChangesToAssociatedObjects(existingIdea);
    return existingIdea;
  }

  saveIdea(idea: Idea): Idea {
    idea.tags.forEach((tag) => {
      if (!this.db.flagTagExistById(tag.id)) {
        throw new Error(`All tags must have id.`);
      }
    });

    idea.concepts.forEach((concept) => {
      if (!this.db.flagConceptExistById(concept.id)) {
        throw new Error(`All child concepts must have id.`);
      }
    });

    idea.parents.forEach((parent) => {
      if (!this.db.flagIdeaExistById(parent.id)) {
        throw new Error(`All parents must have id.`);
      }
    });

    if (this._ideaExist(idea)) {
      return this.updateIdea(idea);
    }
    return this.insertIdea(idea);
  }

  getChildIdea(idea: Idea): ChildIdea {
    let child = new ChildIdea();
    child.id = idea.id;
    child.topic = idea.topic;
    return child;
  }

  changeTopicName(idea: Idea, newTopic: string): Idea {
    if (this.db.flagIdeaExistById(idea.id)) {
      let existingIdea = this.db.getIdeaById(idea.id);
      existingIdea.setTopic(newTopic);

      this.history.saveIdea(existingIdea.id);
      existingIdea.lasUpdated = new Date().getTime();
      let result = this.db.setIdeaToIdMap(existingIdea);
      this.db.setIdeaToTopicMap(existingIdea);
      this.sync.propagateIdeaChangesToAssociatedObjects(existingIdea);
      return result;
    }
    throw new Error(`An Idea with id ${idea.id} does not exist.`);
  }

  removeParentRelationship(idea: Idea, parentId: number): Idea {
    if (!this._ideaExist(idea)) {
      return idea;
    }

    let existingIdea = this.db.getIdeaById(idea.id);

    let resultList = existingIdea.parents.filter((x) => x.id === parentId);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No parent with id ${parentId}`);
      return existingIdea;
    }

    existingIdea.parents = existingIdea.parents.filter(
      (x) => x.id !== parentId
    );

    this.history.saveIdea(existingIdea.id);
    existingIdea.lasUpdated = new Date().getTime();
    let result = this.db.setIdeaToIdMap(existingIdea);
    this.db.setIdeaToTopicMap(existingIdea);
    return result;
  }

  removeConceptRelationship(idea: Idea, conceptId: number): Idea {
    if (!this._ideaExist(idea)) {
      return idea;
    }

    let existingIdea = this.db.getIdeaById(idea.id);

    let resultList = existingIdea.concepts.filter((x) => x.id === conceptId);

    if (resultList.length < 1) {
      console.log(
        `Nothing to remove. No Concept relationship with id ${conceptId}`
      );
      return existingIdea;
    }

    existingIdea.concepts = existingIdea.concepts.filter(
      (x) => x.id !== conceptId
    );

    this.history.saveIdea(existingIdea.id);
    existingIdea.lasUpdated = new Date().getTime();
    let result = this.db.setIdeaToIdMap(existingIdea);
    this.db.setIdeaToTopicMap(existingIdea);
    return result;
  }

  removeTagRelationship(idea: Idea, tagId: number): Idea {
    if (!this._ideaExist(idea)) {
      return idea;
    }

    let existingIdea = this.db.getIdeaById(idea.id);

    let resultList = existingIdea.tags.filter((x) => x.id === tagId);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No Tag relationship with id ${tagId}`);
      return existingIdea;
    }

    existingIdea.tags = existingIdea.tags.filter((x) => x.id !== tagId);

    this.history.saveIdea(existingIdea.id);
    existingIdea.lasUpdated = new Date().getTime();
    let result = this.db.setIdeaToIdMap(existingIdea);
    this.db.setIdeaToTopicMap(existingIdea);
    return result;
  }

  removeIdea(idea: Idea): void {
    if (!this._ideaExist(idea)) {
      return;
    }

    this.db.deleteIdeaFromMapId(idea);
    this.db.deleteIdeaFromMapTopic(idea);
  }

  constructor(
    private db: InMemoryDatabaseService,
    private sync: SyncService,
    private history: HistoricService
  ) {}
}
