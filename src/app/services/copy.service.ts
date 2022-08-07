import { ChildTag } from './../shared/tag';
import { ChildConcept } from './../shared/concept';
import { ChildIdea } from './../shared/idea';
import { Idea } from 'src/app/shared/idea';
import { Injectable } from '@angular/core';
import { Tag } from '../shared/tag';
import { Concept } from '../shared/concept';

@Injectable({
  providedIn: 'root',
})
export class CopyService {
  constructor() {}

  public getConceptLisCopy(conceptList: Concept[]): Concept[] {
    let copyResult: Concept[] = [];
    conceptList.forEach((concept) => {
      copyResult.push(this.getConceptCopy(concept));
    });

    return copyResult;
  }

  public getIdeaLisCopy(ideaList: Idea[]): Idea[] {
    let copyResult: Idea[] = [];
    ideaList.forEach((idea) => {
      copyResult.push(this.getIdeaCopy(idea));
    });

    return copyResult;
  }
  public getTagLisCopy(tagList: Tag[]): Tag[] {
    let copyResult: Tag[] = [];
    tagList.forEach((tag) => {
      copyResult.push(this.getTagCopy(tag));
    });

    return copyResult;
  }

  public getConceptCopy(concept: Concept): Concept {
    let conceptCopy = new Concept();
    conceptCopy.id = concept.id;
    conceptCopy.status = concept.status;
    conceptCopy.priorityOrder = concept.priorityOrder;
    conceptCopy.isImportant = concept.isImportant;
    conceptCopy.isUrgent = concept.isUrgent;
    conceptCopy.content = concept.content;
    conceptCopy.created = concept.created;
    conceptCopy.lasUpdated = concept.lasUpdated;
    conceptCopy.type = concept.type;

    concept.tags.forEach((tag) => {
      let childTag = new ChildTag();
      childTag.id = tag.id;
      childTag.name = tag.name;
      conceptCopy.tags.push(tag);
    });

    concept.parents.forEach((idea) => {
      let childIdea = new ChildIdea();
      childIdea.id = idea.id;
      childIdea.topic = idea.topic;
      conceptCopy.parents.push(childIdea);
    });

    return conceptCopy;
  }

  public getIdeaCopy(idea: Idea): Idea {
    let ideaCopy = new Idea(idea.topic);
    ideaCopy.id = idea.id;
    ideaCopy.type = idea.type;
    ideaCopy.status = idea.status;
    ideaCopy.priorityOrder = idea.priorityOrder;
    ideaCopy.isImportant = idea.isImportant;
    ideaCopy.isUrgent = idea.isUrgent;
    ideaCopy.created = idea.created;
    ideaCopy.lasUpdated = idea.lasUpdated;

    idea.concepts.forEach((concept) => {
      let conceptCopy = this.getConceptCopy(concept);
      ideaCopy.concepts.push(conceptCopy);
    });

    idea.tags.forEach((tag) => {
      let childTag = new ChildTag();
      childTag.id = tag.id;
      childTag.name = tag.name;
      ideaCopy.tags.push(childTag);
    });

    idea.parents.forEach((idea) => {
      let childIdea = new ChildIdea();
      childIdea.id = idea.id;
      childIdea.topic = idea.topic;
      ideaCopy.parents.push(childIdea);
    });

    return ideaCopy;
  }

  public getTagCopy(tag: Tag): Tag {
    let tagCopy = new Tag(tag.name);
    tagCopy.id = tag.id;
    tagCopy.label = tag.label;
    tagCopy.priorityOrder = tag.priorityOrder;
    tagCopy.isImportant = tag.isImportant;
    tagCopy.isUrgent = tag.isUrgent;
    tagCopy.created = tag.created;
    tagCopy.lasUpdated = tag.lasUpdated;

    tag.concepts.forEach((concept) => {
      let childConcept = new ChildConcept();
      childConcept.content = concept.content;
      childConcept.id = concept.id;
      childConcept.type = concept.type;
      tagCopy.concepts.push(childConcept);
    });

    tag.ideas.forEach((idea) => {
      let childIdea = new ChildIdea();
      childIdea.id = idea.id;
      childIdea.topic = idea.topic;
      tagCopy.ideas.push(childIdea);
    });

    tag.keywords.forEach((keyword) => {
      tagCopy.keywords.push(keyword);
    });

    return tagCopy;
  }
}
