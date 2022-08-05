import { ChildIdea } from './../shared/idea';
import { InMemoryDatabaseService } from './in-memory-database.service';
import { Injectable } from '@angular/core';
import { Idea } from '../shared/idea';

@Injectable({
  providedIn: 'root',
})
export class InMemoryIdeaDatabaseService {
  ideaExist(idea: Idea): boolean {
    if (idea.id > 0) {
      if (this.db.ideaIdMap.has(idea.id)) {
        return true;
      }

      throw new Error(`An Idea with id ${idea.id} does not exist.`);
    }

    if (this.db.ideaTopicMap.has(idea.topic.trim())) {
      return true;
    }

    return false;
  }

  insertIdea(idea: Idea): Idea {
    let currentDate = new Date().getTime();
    idea.created = currentDate;
    idea.lasUpdated = currentDate;

    this.db._saveIdea(idea);
    return idea;
  }

  updateIdea(idea: Idea): Idea {
    let existingIdea =
      idea.id > 0
        ? this.db.ideaIdMap.get(idea.id)!
        : this.db.ideaTopicMap.get(idea.topic)!;

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

    let currentDate = new Date().getTime();
    // existingIdea.created is not going to be updated here.
    existingIdea.lasUpdated = currentDate;

    this.db._saveIdea(existingIdea);
    return existingIdea;
  }

  saveIdea(idea: Idea): Idea {
    idea.tags.forEach((tag) => {
      if (!this.db.tagIdMap.has(tag.id)) {
        throw new Error(`All tags must have id.`);
      }
    });

    idea.concepts.forEach((concept) => {
      if (!this.db.conceptIdMap.has(concept.id)) {
        throw new Error(`All child concepts must have id.`);
      }
    });

    idea.parents.forEach((parent) => {
      if (!this.db.ideaIdMap.has(parent.id)) {
        throw new Error(`All parents must have id.`);
      }
    });

    if (this.ideaExist(idea)) {
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
    if (this.db.ideaIdMap.has(idea.id)) {
      let ideaDb = this.db.ideaIdMap.get(idea.id)!;
      ideaDb.setTopic(newTopic);
      return ideaDb;
    }
    throw new Error(`An Idea with id ${idea.id} does not exist.`);
  }

  removeParentRelationship(idea: Idea, parentId: number): Idea {
    if (!this.ideaExist(idea)) {
      return idea;
    }

    let ideaDb = this.db.ideaIdMap.get(idea.id)!;

    let resultList = ideaDb.parents.filter((x) => x.id === parentId);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No parent with id ${parentId}`);
      return ideaDb;
    }

    ideaDb.parents = ideaDb.parents.filter((x) => x.id !== parentId);
    return ideaDb;
  }

  removeConceptRelationship(idea: Idea, conceptId: number): Idea {
    if (!this.ideaExist(idea)) {
      return idea;
    }

    let ideaDb = this.db.ideaIdMap.get(idea.id)!;

    let resultList = ideaDb.concepts.filter((x) => x.id === conceptId);

    if (resultList.length < 1) {
      console.log(
        `Nothing to remove. No Concept relationship with id ${conceptId}`
      );
      return ideaDb;
    }

    ideaDb.concepts = ideaDb.concepts.filter((x) => x.id !== conceptId);
    return ideaDb;
  }

  removeTagRelationship(idea: Idea, tagId: number): Idea {
    if (!this.ideaExist(idea)) {
      return idea;
    }

    let ideaDb = this.db.ideaIdMap.get(idea.id)!;

    let resultList = ideaDb.tags.filter((x) => x.id === tagId);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No Tag relationship with id ${tagId}`);
      return ideaDb;
    }

    ideaDb.tags = ideaDb.tags.filter((x) => x.id !== tagId);
    return ideaDb;
  }

  removeIdea(idea: Idea): void {
    if (!this.ideaExist(idea)) {
      return;
    }

    let ideaId = idea.id;
    let ideaTopic = idea.topic;

    this.db.ideaIdMap.delete(ideaId)!;
    this.db.ideaTopicMap.delete(idea.topic)!;
  }

  constructor(private db: InMemoryDatabaseService) {}
}
