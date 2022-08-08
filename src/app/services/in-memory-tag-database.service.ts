import { SyncService } from './sync.service';
import { HistoricService } from './historic.service';
import { Injectable } from '@angular/core';
import { ChildTag, Tag } from '../shared/tag';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Injectable({
  providedIn: 'root',
})
export class InMemoryTagDatabaseService {
  insertTag(tag: Tag): Tag {
    let currentDate = new Date().getTime();
    tag.created = currentDate;
    tag.lasUpdated = currentDate;
    let result = this.db.setTagToIdMap(tag);
    this.db.setTagToNameMap(result);
    this.sync.propagateTagChangesToAssociatedObjects(tag);
    return result;
  }

  updateTag(tag: Tag): Tag {
    let existingTag =
      tag.id > 0 ? this.db.getTagById(tag.id)! : this.db.getTagByName(tag.name);

    //existingTag.name = tag.name; <-- we are not going to do it here
    existingTag.isImportant = tag.isImportant;
    existingTag.isUrgent = tag.isUrgent;
    existingTag.priorityOrder = tag.priorityOrder;
    existingTag.label = tag.label;

    tag.concepts.forEach((concept) => {
      if (
        existingTag.concepts.filter((x) => x.id === concept.id).length === 0
      ) {
        existingTag.concepts.push(concept);
      }
    });

    tag.ideas.forEach((idea) => {
      if (existingTag.ideas.filter((x) => x.id === idea.id).length === 0) {
        existingTag.ideas.push(idea);
      }
    });

    tag.keywords.forEach((keyword) => {
      if (existingTag.keywords.filter((x) => x === keyword).length === 0) {
        existingTag.keywords.push(keyword);
      }
    });

    this.history.saveTag(existingTag.id);
    existingTag.lasUpdated = new Date().getTime();
    let result = this.db.setTagToIdMap(existingTag);
    this.db.setTagToNameMap(existingTag);
    this.sync.propagateTagChangesToAssociatedObjects(existingTag);
    return result;
  }

  saveTag(tag: Tag): Tag {
    tag.concepts.forEach((concept) => {
      if (!this.db.flagConceptExistById(concept.id)) {
        throw new Error(`All concepts must have id.`);
      }
    });

    tag.ideas.forEach((idea) => {
      if (!this.db.flagIdeaExistById(idea.id)) {
        throw new Error(`All ideas must have id.`);
      }
    });

    if (this.tagExist(tag)) {
      return this.updateTag(tag);
    }

    return this.insertTag(tag);
  }

  getChildTag(tag: ChildTag): ChildTag {
    let result = new ChildTag();
    result.id = tag.id;
    result.name = tag.name;
    return result;
  }

  changeTagName(tag: Tag, newTagName: string): Tag {
    if (!this.db.flagTagExistById(tag.id)) {
      throw new Error(`A Tag with id ${tag.id} does not exist.`);
    }

    let existingTag = this.db.getTagById(tag.id);
    this.history.saveTag(existingTag.id);

    existingTag.setName(newTagName);
    existingTag.lasUpdated = new Date().getTime();

    // aquí yo necesito que todos las idea.childTags asociados actualicen el childTag.name
    existingTag = this.sync.syncTag(existingTag);
    console.log('existingTag: ', existingTag);

    let result = this.db.setTagToIdMap(existingTag);
    this.db.setTagToNameMap(existingTag);
    return result;
  }

  removeIdeaRelationship(tag: Tag, parentId: number): Tag {
    if (!this.tagExist(tag)) {
      return tag;
    }

    let existingTag = this.db.getTagById(tag.id);

    let resultList = existingTag.ideas.filter((x) => x.id === parentId);

    if (resultList.length < 1) {
      console.log(
        `Nothing to remove. No Idea relationship with id ${parentId}`
      );
      return existingTag;
    }

    existingTag.ideas = existingTag.ideas.filter((x) => x.id !== parentId);

    this.history.saveTag(existingTag.id);
    existingTag.lasUpdated = new Date().getTime();
    let result = this.db.setTagToIdMap(existingTag);
    this.db.setTagToNameMap(existingTag);
    return result;
  }

  removeConceptRelationship(tag: Tag, conceptId: number): Tag {
    if (!this.tagExist(tag)) {
      return tag;
    }

    let existingTag = this.db.getTagById(tag.id);

    let resultList = existingTag.concepts.filter((x) => x.id === conceptId);

    if (resultList.length < 1) {
      console.log(
        `Nothing to remove. No Concept relationship with id ${conceptId}`
      );
      return existingTag;
    }

    existingTag.concepts = existingTag.concepts.filter(
      (x) => x.id !== conceptId
    );

    this.history.saveTag(existingTag.id);
    existingTag.lasUpdated = new Date().getTime();
    let result = this.db.setTagToIdMap(existingTag);
    this.db.setTagToNameMap(existingTag);
    return result;
  }

  removeKeywordRelationship(tag: Tag, keyword: string): Tag {
    if (!this.tagExist(tag)) {
      return tag;
    }

    let existingTag = this.db.getTagById(tag.id);

    let resultList = existingTag.keywords.filter((x) => x === keyword);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No keyword relationship '${keyword}'`);
      return existingTag;
    }

    existingTag.keywords = existingTag.keywords.filter((x) => x !== keyword);

    this.history.saveTag(existingTag.id);
    existingTag.lasUpdated = new Date().getTime();
    let result = this.db.setTagToIdMap(existingTag);
    this.db.setTagToNameMap(existingTag);
    return result;
  }

  private tagExist(tag: Tag): boolean {
    if (tag.id > 0) {
      if (this.db.flagTagExistById(tag.id)) {
        return true;
      }

      throw new Error(`A Tag with id ${tag.id} does not exist.`);
    }

    return this.db.flagTagExistByName(tag.name);
  }

  removeTag(tag: Tag): void {
    this.db.deleteTagFromMapId(tag);
    this.db.deleteTagFromMapName(tag);
  }

  constructor(
    private db: InMemoryDatabaseService,
    private sync: SyncService,
    private history: HistoricService
  ) {}
}
