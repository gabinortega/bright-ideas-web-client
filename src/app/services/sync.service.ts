import { CopyService } from './copy.service';
import { ChildConcept } from './../shared/concept';
import { ChildTag } from './../shared/tag';
import { Injectable } from '@angular/core';
import { InMemoryDatabaseService } from './in-memory-database.service';
import { Tag } from '../shared/tag';
import { InMemoryTagDatabaseService } from './in-memory-tag-database.service';
import { InMemoryConceptDatabaseService } from './in-memory-concept-database.service';
import { InMemoryIdeaDatabaseService } from './in-memory-idea-database.service';
import { ChildIdea, Idea } from '../shared/idea';
import { HistoricService } from './historic.service';
import { Concept } from '../shared/concept';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  constructor(
    private db: InMemoryDatabaseService,
    private history: HistoricService
  ) {}

  propagateTagChangesToAssociatedObjects(tag: Tag) {
    this.propagateTagChangesToAssociatedConcepts(tag);
    this.propagateTagChangesToAssociatedIdeas(tag);
  }

  private propagateTagChangesToAssociatedIdeas(tag: Tag) {
    tag.ideas?.forEach((childIdea) => {
      if (!this.db.flagIdeaExistById(childIdea.id)) {
        return;
      }

      let existingIdea = this.db.getIdeaById(childIdea.id);

      if (existingIdea.tags.filter((x) => x.id === tag.id).length > 0) {
        let childTag = existingIdea.tags.filter((x) => x.id === tag.id)[0];
        if (childTag.name !== tag.name) {
          this.history.saveIdea(existingIdea.id);
          existingIdea.lasUpdated = new Date().getTime();
          childTag.name = tag.name;
          this.db.setIdeaToIdMap(existingIdea);
          this.db.setIdeaToTopicMap(existingIdea);
        }
      } else {
        existingIdea.tags.push(new ChildTag(tag.id, tag.name));
        this.history.saveIdea(existingIdea.id);
        existingIdea.lasUpdated = new Date().getTime();
        this.db.setIdeaToIdMap(existingIdea);
        this.db.setIdeaToTopicMap(existingIdea);
      }
    });
  }

  private propagateTagChangesToAssociatedConcepts(tag: Tag) {
    tag.concepts?.forEach((childConcept) => {
      if (!this.db.flagConceptExistById(childConcept.id)) {
        return;
      }
      let existingConcept = this.db.getConceptById(childConcept.id);

      if (existingConcept.tags.filter((x) => x.id === tag.id).length > 0) {
        let childTag = existingConcept.tags.filter((x) => x.id === tag.id)[0];
        if (childTag.name !== tag.name) {
          this.history.saveConcept(existingConcept.id);
          existingConcept.lasUpdated = new Date().getTime();
          childTag.name = tag.name;
          this.db.setConceptToIdMap(existingConcept);
          this.db.insertConceptToSortByContentList(existingConcept);
        }
      } else {
        let childTag = new ChildTag(tag.id, tag.name);

        existingConcept.tags.push(childTag);
        this.history.saveConcept(existingConcept.id);
        existingConcept.lasUpdated = new Date().getTime();
        this.db.setConceptToIdMap(existingConcept);
        this.db.insertConceptToSortByContentList(existingConcept);
      }
    });
  }

  public propagateConceptChangesToAssociatedObjects(concept: Concept): void {
    this.propagateConceptChangesToAssociatedParents(concept);
    this.propagateConceptChangesToAssociatedTags(concept);
  }

  /**
   * Summary:
   * Actualiza todos las Ideas asociadas a este Concepto.
   *   1. De cada uno de estas Ideas se actualiza el Concepto correspondiente
   *   2. Para nuevas asociaciones se creará una nuevo Concepto
   * Remarks:
   * @param concept el Concepto con el listado de child Tags que se utilizará para actualizar los Tags asociados
   */
  private propagateConceptChangesToAssociatedParents(concept: Concept): void {
    concept.parents?.forEach((parentIdea) => {
      if (!this.db.flagIdeaExistById(parentIdea.id)) {
        return;
      }

      let existingIdea = this.db.getIdeaById(parentIdea.id);

      if (existingIdea.concepts.filter((x) => x.id === concept.id).length > 0) {
        let childConcept = existingIdea.concepts.filter(
          (x) => x.id === concept.id
        )[0];
        if (childConcept.content !== concept.content) {
          this.history.saveIdea(existingIdea.id);
          existingIdea.lasUpdated = new Date().getTime();
          childConcept.content = concept.content;
          this.db.setIdeaToIdMap(existingIdea);
          this.db.setIdeaToTopicMap(existingIdea);
        }
      } else {
        existingIdea.concepts.push(concept);
        this.history.saveIdea(existingIdea.id);
        existingIdea.lasUpdated = new Date().getTime();
        this.db.setIdeaToIdMap(existingIdea);
        this.db.setIdeaToTopicMap(existingIdea);
      }
    });
  }

  /**
   * Summary:
   * Actualiza todos los Tags asociados a este Concepto.
   *   1. De cada uno de estos Tags se actualiza la Child Concept correspondiente
   *   2. Para nuevas asociaciones se creará una nueva Child Concept
   * Remarks:
   * @param concept el Concepto con el listado de child Tags que se utilizará para actualizar los Tags asociados
   */
  private propagateConceptChangesToAssociatedTags(concept: Concept): void {
    concept.tags?.forEach((childTag) => {
      if (!this.db.flagTagExistById(childTag.id)) {
        return;
      }

      let existingTag = this.db.getTagById(childTag.id);

      if (existingTag.concepts.filter((x) => x.id === concept.id).length > 0) {
        let childConcept = existingTag.concepts.filter(
          (x) => x.id === concept.id
        )[0];
        if (childConcept.content !== concept.content) {
          this.history.saveTag(existingTag.id);
          existingTag.lasUpdated = new Date().getTime();
          childConcept.content = concept.content;
          this.db.setTagToIdMap(existingTag);
          this.db.setTagToNameMap(existingTag);
        }
      } else {
        let childConcept = new ChildConcept(concept.id, concept.content);

        existingTag.concepts.push(childConcept);
        this.history.saveTag(existingTag.id);
        existingTag.lasUpdated = new Date().getTime();
        this.db.setTagToIdMap(existingTag);
        this.db.setTagToNameMap(existingTag);
      }
    });
  }

  public propagateIdeaChangesToAssociatedObjects(idea: Idea): void {
    this.propagateIdeaChangesToAssociatedTags(idea);
    this.propagateIdeaChangesToAssociatedConcepts(idea);
  }

  /**
   * Summary:
   * Actualiza todos los Conceptos asociados a esta Idea.
   *   1. De cada uno de estos Conceptos se actualiza la Child Idea correspondiente
   *   2. Para nuevas asociaciones se creará una nueva Child Idea
   * Remarks:
   * @param idea la Idea con el listado de Child Tags que se utilizará para actualizar los Tags asociados
   */
  private propagateIdeaChangesToAssociatedConcepts(idea: Idea): void {
    idea.concepts?.forEach((childConcept) => {
      if (!this.db.flagConceptExistById(childConcept.id)) {
        return;
      }
      let existingConcept = this.db.getConceptById(childConcept.id);

      if (existingConcept.parents.filter((x) => x.id === idea.id).length > 0) {
        let childIdea = existingConcept.parents.filter(
          (x) => x.id === idea.id
        )[0];
        if (childIdea.topic !== idea.topic) {
          this.history.saveConcept(existingConcept.id);
          existingConcept.lasUpdated = new Date().getTime();
          childIdea.topic = idea.topic;
          this.db.setConceptToIdMap(existingConcept);
          this.db.insertConceptToSortByContentList(existingConcept);
        }
      } else {
        let childIdea = new ChildIdea(idea.id, idea.topic);

        existingConcept.parents.push(childIdea);
        this.history.saveConcept(existingConcept.id);
        existingConcept.lasUpdated = new Date().getTime();
        this.db.setConceptToIdMap(existingConcept);
        this.db.insertConceptToSortByContentList(existingConcept);
      }
    });
  }

  /**
   * Summary:
   * Actualiza todos los Tags asociados a esta Idea.
   *   1. De cada uno de estos Tags se actualiza la Child Idea correspondiente
   *   2. Para nuevas asociaciones se creará una nueva Child Idea
   * Remarks:
   * @param idea la Idea con el listado de Child Tags que se utilizará para actualizar los Tags asociados
   */
  private propagateIdeaChangesToAssociatedTags(idea: Idea): void {
    idea.tags?.forEach((childTag) => {
      if (!this.db.flagTagExistById(childTag.id)) {
        return;
      }
      let existingTag = this.db.getTagById(childTag.id);

      if (existingTag.ideas.filter((x) => x.id === idea.id).length > 0) {
        let childIdea = existingTag.ideas.filter((x) => x.id === idea.id)[0];
        if (childIdea.topic !== idea.topic) {
          this.history.saveTag(existingTag.id);
          existingTag.lasUpdated = new Date().getTime();
          childIdea.topic = idea.topic;
          this.db.setTagToIdMap(existingTag);
          this.db.setTagToNameMap(existingTag);
        }
      } else {
        let childIdea = new ChildIdea(idea.id, idea.topic);

        existingTag.ideas.push(childIdea);
        this.history.saveTag(existingTag.id);
        existingTag.lasUpdated = new Date().getTime();
        this.db.setTagToIdMap(existingTag);
        this.db.setTagToNameMap(existingTag);
      }
    });
  }

  private syncIdea(idea: Idea): void {
    // ver todos los conceptos children que esta idea tiene.
    // buscar child tras child en la base de datos de conceptos y verificar si tiene información actualizada
    // si el concepto en la base de datos tiene información actualizada entonces actualizar el child

    /*

    idea.concepts.forEach((concept) => {
      let existingConcept = this.db.getConceptById(concept.id);
      concept.content
      childConcept.id = con;
      this.conceptDb.saveConcept(existingConcept);
    });
    */

    idea.tags.forEach((childTag) => {
      let tabDb = this.db.getTagById(childTag.id);
      childTag.name = tabDb.name;
    });

    idea.parents.forEach((parentIdea) => {
      let ideaDb = this.db.getIdeaById(parentIdea.id);
      parentIdea.topic = ideaDb.topic;
    });
  }

  syncTag(tag: Tag): Tag {
    const tagId = tag.id;
    const tagName = tag.name;
    const thisChildTag = new ChildTag(tagId, tagName);

    // por cada uno de los Child Concepts de este Tag
    tag.concepts.forEach((conceptChild) => {
      // GET Concept
      let concept = this.db.getConceptById(conceptChild.id);

      // PULL update this Tag's Child Concept with the latest information from this associated Concept
      conceptChild.content = concept.content;
      conceptChild.type = concept.type;

      // PUSH update this associated Concept's Child Tag with the latest information from this Tag.
      if (concept.tags.filter((x) => x.id === tagId).length > 0) {
        let childTag: ChildTag = concept.tags.filter((x) => x.id === tagId)[0];
        let index = concept.tags.indexOf(childTag);
        concept.tags.splice(index, 1, thisChildTag);
      } else {
        concept.tags.push(thisChildTag);
      }

      // SAVE changes all changes (Concept changes and Concept's Child Tag changes)
      this.history.saveConcept(concept.id);
      concept.lasUpdated = new Date().getTime();
      this.db.setConceptToIdMap(concept);
      this.db.updateConceptToSortByContentList(concept);
    });

    // por cada uno de los Child Concepts de este Tag
    tag.ideas.forEach((childIdea) => {
      // GET Idea
      let idea = this.db.getIdeaById(childIdea.id);

      // PULL update this Tag's Child Idea with the latest information from this associated Idea
      childIdea.topic = idea.topic;

      // PUSH update this associated Idea's Child Tag with the latest information from this Tag.
      if (idea.tags.filter((x) => x.id == tagId).length > 0) {
        let childTag: ChildTag = idea.tags.filter((x) => x.id === tagId)[0];
        let index = idea.tags.indexOf(childTag);
        idea.tags.splice(index, 1, thisChildTag);
      } else {
        idea.tags.push(thisChildTag);
      }

      // SAVE changes all changes (Idea changes and Idea's Child Tag changes)
      this.history.saveIdea(idea.id);
      idea.lasUpdated = new Date().getTime();
      this.db.setIdeaToIdMap(idea);
      this.db.setIdeaToTopicMap(idea);
    });

    //return this Tag with the all children already updated
    return tag;
  }

  public propagateTagChanges(tag: Tag): void {}
}
