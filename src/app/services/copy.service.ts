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
    let copyConcept = new Concept();
    copyConcept.id = concept.id;
    copyConcept.status = concept.status;
    copyConcept.priorityOrder = concept.priorityOrder;
    copyConcept.isImportant = concept.isImportant;
    copyConcept.isUrgent = concept.isUrgent;
    copyConcept.content = concept.content;
    copyConcept.created = concept.created;
    copyConcept.lasUpdated = concept.lasUpdated;
    copyConcept.type = concept.type;

    concept.tags.forEach((tag) => {
      copyConcept.tags.push(new ChildTag(tag.id, tag.name));
    });

    concept.parents.forEach((idea) => {
      copyConcept.parents.push(new ChildIdea(idea.id, idea.topic));
    });

    return copyConcept;
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
      ideaCopy.concepts.push(this.getConceptCopy(concept));
    });

    idea.tags.forEach((tag) => {
      ideaCopy.tags.push(new ChildTag(tag.id, tag.name));
    });

    idea.parents.forEach((idea) => {
      ideaCopy.parents.push(new ChildIdea(idea.id, idea.topic));
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
      let copyConcept = new ChildConcept(
        concept.id,
        concept.content,
        concept.type
      );
      tagCopy.concepts.push(copyConcept);
    });

    tag.ideas.forEach((idea) => {
      let copyIdea = new ChildIdea();
      copyIdea.id = idea.id;
      copyIdea.topic = idea.topic;
      tagCopy.ideas.push(copyIdea);
    });

    tag.keywords.forEach((keyword) => {
      tagCopy.keywords.push(keyword);
    });

    return tagCopy;
  }
}
