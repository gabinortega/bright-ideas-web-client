import { Injectable } from '@angular/core';
import { ChildTag, Tag } from '../shared/tag';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Injectable({
  providedIn: 'root',
})
export class InMemoryTagDatabaseService {
  tagExist(tag: Tag): boolean {
    if (tag.id > 0) {
      if (this.db.tagIdMap.has(tag.id)) {
        return true;
      }

      throw new Error(`A Tag with id ${tag.id} does not exist.`);
    }

    return this.db.tagNameMap.has(tag.name.trim());
  }

  insertTag(tag: Tag): Tag {
    let currentDate = new Date().getTime();
    tag.created = currentDate;
    tag.lasUpdated = currentDate;
    this.db._saveTag(tag);
    return tag;
  }

  updateTag(tag: Tag): Tag {
    let existingTag =
      tag.id > 0
        ? this.db.tagIdMap.get(tag.id)!
        : this.db.tagNameMap.get(tag.name)!;

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

    existingTag.lasUpdated = new Date().getTime();
    this.db._saveTag(existingTag);
    return existingTag;
  }

  saveTag(tag: Tag): Tag {
    tag.concepts.forEach((concept) => {
      if (!this.db.conceptIdMap.has(concept.id)) {
        throw new Error(`All concepts must have id.`);
      }
    });

    tag.ideas.forEach((idea) => {
      if (!this.db.ideaIdMap.has(idea.id)) {
        throw new Error(`All ideas must have id.`);
      }
    });

    if (this.tagExist(tag)) {
      return this.updateTag(tag);
    }

    return this.insertTag(tag);
  }

  getTagFromDb(name: string): Tag {
    if (this.db.tagNameMap.has(name)) {
      return this.db.tagNameMap.get(name)!;
    }

    let newTag = new Tag(name);
    this.db._saveTag(newTag);
    return newTag;
  }

  getChildTag(tag: ChildTag): ChildTag {
    let result = new ChildTag();
    result.id = tag.id;
    result.name = tag.name;
    return result;
  }

  changeTagName(tag: Tag, newTagName: string): Tag {
    if (this.db.tagIdMap.has(tag.id)) {
      let tagDb = this.db.tagIdMap.get(tag.id)!;
      tagDb.setName(newTagName);
      return tagDb;
    }
    throw new Error(`A Tag with id ${tag.id} does not exist.`);
  }

  removeIdeaRelationship(tag: Tag, parentId: number): Tag {
    if (!this.tagExist(tag)) {
      return tag;
    }

    let tagDb = this.db.tagIdMap.get(tag.id)!;

    let resultList = tagDb.ideas.filter((x) => x.id === parentId);

    if (resultList.length < 1) {
      console.log(
        `Nothing to remove. No Idea relationship with id ${parentId}`
      );
      return tagDb;
    }

    tagDb.ideas = tagDb.ideas.filter((x) => x.id !== parentId);
    return tagDb;
  }

  removeConceptRelationship(tag: Tag, conceptId: number): Tag {
    if (!this.tagExist(tag)) {
      return tag;
    }

    let tagDb = this.db.tagIdMap.get(tag.id)!;

    let resultList = tagDb.concepts.filter((x) => x.id === conceptId);

    if (resultList.length < 1) {
      console.log(
        `Nothing to remove. No Concept relationship with id ${conceptId}`
      );
      return tagDb;
    }

    tagDb.concepts = tagDb.concepts.filter((x) => x.id !== conceptId);
    return tagDb;
  }

  removeKeywordRelationship(tag: Tag, keyword: string): Tag {
    if (!this.tagExist(tag)) {
      return tag;
    }

    let tagDb = this.db.tagIdMap.get(tag.id)!;

    let resultList = tagDb.keywords.filter((x) => x === keyword);

    if (resultList.length < 1) {
      console.log(`Nothing to remove. No keyword relationship '${keyword}'`);
      return tagDb;
    }

    tagDb.keywords = tagDb.keywords.filter((x) => x !== keyword);
    return tagDb;
  }

  removeTag(tag: Tag): void {
    if (!this.tagExist(tag)) {
      return;
    }

    let tagId = tag.id;
    let tagName = tag.name;

    this.db.tagIdMap.delete(tagId)!;
    this.db.tagNameMap.delete(tagName)!;
  }

  constructor(private db: InMemoryDatabaseService) {}
}
