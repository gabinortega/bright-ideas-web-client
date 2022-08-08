import { ConceptType } from './../shared/concept';
import { ChildIdea } from './../shared/idea';
import { TestBed } from '@angular/core/testing';
import { Concept } from '../shared/concept';
import { Idea } from '../shared/idea';

import { InMemoryDatabaseService } from './in-memory-database.service';
import { InMemoryIdeaDatabaseService } from './in-memory-idea-database.service';
import { ChildTag, Tag } from '../shared/tag';
import { InMemoryTagDatabaseService } from './in-memory-tag-database.service';
import { InMemoryConceptDatabaseService } from './in-memory-concept-database.service';

describe('InMemoryIdeaDatabaseService', () => {
  let db: InMemoryDatabaseService;
  let ideaSut: InMemoryIdeaDatabaseService;
  let tagSut: InMemoryTagDatabaseService;
  let conceptSut: InMemoryConceptDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    db = TestBed.inject(InMemoryDatabaseService);
    ideaSut = TestBed.inject(InMemoryIdeaDatabaseService);
    tagSut = TestBed.inject(InMemoryTagDatabaseService);
    conceptSut = TestBed.inject(InMemoryConceptDatabaseService);
  });

  it('InMemoryIdeaDatabase service should be created', () => {
    expect(db).toBeTruthy();
  });

  it('T01.01.01 InMemoryIdeaDatabase service should increase every time an idea is saved', () => {
    let idea = new Idea('topic01');
    ideaSut.saveIdea(idea);

    expect(db.ideaDbLength).toEqual(1);
  });

  it('T01.01.01.1 When saving an Idea Given an existing id Should update an existing Idea', () => {
    let idea01 = new Idea('00000001');
    ideaSut.saveIdea(idea01);

    let idea02 = new Idea('00000002');
    ideaSut.saveIdea(idea02);

    const topic = 'topic-1234656';
    const topicUpdated = 'topic-1234656+update it';
    let idea = new Idea(topic);
    idea.isUrgent = false;
    idea.isImportant = false;
    idea.priorityOrder = 5;
    idea.status = 5;
    idea.type = 5;
    idea.id = 0;
    idea = ideaSut.saveIdea(idea);

    let ideaId = idea.id;

    let idea2 = new Idea(topicUpdated);
    idea2.id = idea.id;

    idea2.isUrgent = true;
    idea2.isImportant = true;
    idea2.priorityOrder = 6;
    idea2.status = 6;
    idea2.type = 6;
    ideaSut.saveIdea(idea2); // saving a new one with the same topic

    expect(db.flagIdeaExistById(ideaId)).toBeTrue();

    let existingIdea = db.getIdeaById(ideaId);

    expect(existingIdea.topic).toEqual(topic); // <-- topic must still the same
    expect(existingIdea.isUrgent).toBeTrue();
    expect(existingIdea.isImportant).toBeTrue();
    expect(existingIdea.priorityOrder).toEqual(6);
    expect(existingIdea.status).toEqual(6);
    expect(existingIdea.type).toEqual(6);
  });

  it('T01.01.01.2 When saving an Idea Given a not existing id Should throw an error', () => {
    const topic = 'topic-1234656';
    let idea = new Idea(topic);
    idea.isUrgent = false;
    idea.isImportant = false;
    idea.priorityOrder = 5;
    idea.status = 5;
    idea.type = 5;

    let ideaId = 454567; // <-- this id DOES NOT exist
    idea.id = ideaId;

    expect(function () {
      ideaSut.saveIdea(idea);
    }).toThrow(new Error(`An Idea with id ${ideaId} does not exist.`));

    expect(db.flagIdeaExistById(ideaId)).toBeFalse();
  });

  it('T01.01.02.1 When saving an Idea Given no Id but an existing topic Should update an existing Idea', () => {
    const topic = 'topic-1234656';
    let idea = new Idea(topic);
    idea.isUrgent = false;
    idea.isImportant = false;
    idea.priorityOrder = 5;
    idea.status = 5;
    idea.type = 5;
    idea.id = 0;
    ideaSut.saveIdea(idea); // making sure it exists

    let idea2 = new Idea(topic);
    idea2.isUrgent = true;
    idea2.isImportant = true;
    idea2.priorityOrder = 6;
    idea2.status = 6;
    idea2.type = 6;
    ideaSut.saveIdea(idea2); // saving a new one with the same topic

    expect(db.flagIdeaExistByTopic(topic)).toBeTrue();

    let existingIdea = db.getIdeaByTopic(topic);

    expect(existingIdea.isUrgent).toBeTrue();
    expect(existingIdea.isImportant).toBeTrue();
    expect(existingIdea.priorityOrder).toEqual(6);
    expect(existingIdea.status).toEqual(6);
    expect(existingIdea.type).toEqual(6);
  });

  it('T01.01.02.2 When saving an Idea Given no Id and not existing topic Should create a new Idea', () => {
    const topic = 'content03';

    let idea = new Idea(topic);

    let concept = new Concept();
    concept.content = 'childConcept01';
    concept.type = ConceptType.image;
    concept = conceptSut.saveConcept(concept);

    let conceptId = concept.id;

    let tag01 = new Tag('flauta');
    tag01 = tagSut.saveTag(tag01);
    let tagId = tag01.id;
    let childTag = tagSut.getChildTag(tag01);

    let parentIdea = new Idea('lol');
    parentIdea = ideaSut.saveIdea(parentIdea);
    let parentId = parentIdea.id;

    let parent = ideaSut.getChildIdea(parentIdea);

    idea.concepts = [concept];
    idea.tags = [childTag];
    idea.parents = [parent];

    ideaSut.saveIdea(idea);

    let ideaUt = db.getIdeaByTopic(topic);

    expect(ideaUt.concepts.length).toBe(1);
    expect(ideaUt.concepts[0].id).toBe(conceptId);
    expect(ideaUt.concepts[0].content).toBe('childConcept01');
    expect(ideaUt.concepts[0].type).toBe(ConceptType.image);

    expect(ideaUt.tags.length).toBe(1);
    expect(ideaUt.tags[0].id).toBe(tagId);
    expect(ideaUt.tags[0].name).toBe('flauta');

    expect(ideaUt.parents.length).toBe(1);
    expect(ideaUt.parents[0].id).toBe(parentId);
    expect(ideaUt.parents[0].topic).toBe('lol');
  });

  it('T01.01.03.1.1.1 When Saving an idea Given a parent being removed Should not remove the parent', () => {
    let ideaParent01 = new Idea('parent01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);

    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('parent02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);

    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let ideaTopic = 'T01.01.03.1.1.1';

    let idea01 = new Idea(ideaTopic);
    idea01.parents = [childIdea01, childIdea02];
    idea01 = ideaSut.saveIdea(idea01);

    expect(db.ideaDbLength).toBe(3);
    let idea01Id = idea01.id;

    let idea02 = new Idea(ideaTopic);
    idea02.id = idea01Id;
    idea02.parents = [];
    idea02 = ideaSut.saveIdea(idea02);

    expect(db.ideaDbLength).toBe(3);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.parents.length).toEqual(2);
    expect(ideaUt02.parents.length).toEqual(2);
  });

  it('T01.01.03.1.1.2 When Saving an idea Given a new parent Should add new parent', () => {
    let ideaParent01 = new Idea('parent01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);
    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('parent02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);
    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let ideaParent03 = new Idea('parent03');
    ideaParent03 = ideaSut.saveIdea(ideaParent03);
    let childIdea03 = ideaSut.getChildIdea(ideaParent03);

    let ideaTopic = 'T01.01.03.1.1.2';

    let idea01 = new Idea(ideaTopic);
    idea01.parents = [childIdea01, childIdea02];
    idea01 = ideaSut.saveIdea(idea01);
    let idea01Id = idea01.id;

    let idea02 = new Idea(ideaTopic);
    idea02.id = idea01Id;
    idea02.parents = [childIdea03];
    idea02 = ideaSut.saveIdea(idea02);

    expect(db.ideaDbLength).toBe(4);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.parents.length).toEqual(3);
    expect(ideaUt02.parents.length).toEqual(3);
  });

  it('T01.01.03.1.1.3 When Removing Parents from Ideas Should remove the parent', () => {
    let ideaParent01 = new Idea('parent01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);

    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('parent02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);

    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let ideaTopic = 'T01.01.03.1.1.3';

    let idea01 = new Idea(ideaTopic);
    idea01.parents = [childIdea01, childIdea02];
    idea01 = ideaSut.saveIdea(idea01);

    expect(db.ideaDbLength).toBe(3);
    let idea01Id = idea01.id;

    idea01 = ideaSut.removeParentRelationship(idea01, ideaParent02.id);

    expect(db.ideaDbLength).toBe(3);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.parents.length).toEqual(1);
    expect(ideaUt02.parents.length).toEqual(1);
  });

  it('T01.01.03.1.2.1 When Saving an idea Given a Concept being removed Should not remove the concept', () => {
    let concept01 = new Concept();
    concept01.content = 'content01';
    concept01 = conceptSut.saveConcept(concept01);

    let concept02 = new Concept();
    concept02.content = 'content02';
    concept02 = conceptSut.saveConcept(concept02);

    let ideaTopic = 'T01.01.03.1.2.1';

    let idea01 = new Idea(ideaTopic);
    idea01.concepts = [concept01, concept02];
    idea01 = ideaSut.saveIdea(idea01);
    let idea01Id = idea01.id;

    let idea02 = new Idea(ideaTopic);
    idea02.id = idea01Id;
    idea02.concepts = [];
    idea02 = ideaSut.saveIdea(idea02);

    expect(db.ideaDbLength).toBe(1);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.concepts.length).toEqual(2);
    expect(ideaUt02.concepts.length).toEqual(2);
  });

  it('T01.01.03.1.2.2 When Saving an idea Given a new Concept Should add new concept', () => {
    let concept01 = new Concept();
    concept01.content = 'content01';
    concept01 = conceptSut.saveConcept(concept01);

    let concept02 = new Concept();
    concept02.content = 'content02';
    concept02 = conceptSut.saveConcept(concept02);

    let concept03 = new Concept();
    concept03.content = 'content03';
    concept03 = conceptSut.saveConcept(concept03);

    let ideaTopic = 'T01.01.03.1.2.2';

    let idea01 = new Idea(ideaTopic);
    idea01.concepts = [concept01, concept02];
    idea01 = ideaSut.saveIdea(idea01);
    let idea01Id = idea01.id;

    let idea02 = new Idea(ideaTopic);
    idea02.id = idea01Id;
    idea02.concepts = [concept03];
    idea02 = ideaSut.saveIdea(idea02);

    expect(db.ideaDbLength).toBe(1);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.concepts.length).toEqual(3);
    expect(ideaUt02.concepts.length).toEqual(3);
  });

  it('T01.01.03.1.2.3 When Saving an idea Given a Concept being removed Should remove the concept', () => {
    let concept01 = new Concept();
    concept01.content = 'content01';
    concept01 = conceptSut.saveConcept(concept01);

    let concept02 = new Concept();
    concept02.content = 'content02';
    concept02 = conceptSut.saveConcept(concept02);

    let ideaTopic = 'T01.01.03.1.2.3';

    let idea01 = new Idea(ideaTopic);
    idea01.concepts = [concept01, concept02];
    idea01 = ideaSut.saveIdea(idea01);
    let idea01Id = idea01.id;

    idea01 = ideaSut.removeConceptRelationship(idea01, concept02.id);

    expect(db.ideaDbLength).toBe(1);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.concepts.length).toEqual(1);
    expect(ideaUt02.concepts.length).toEqual(1);
  });

  it('T01.01.03.1.3.1 When Saving an idea Given a Tag being removed Should not remove the tag', () => {
    let tag01 = new Tag('tag01');
    tag01 = tagSut.saveTag(tag01);
    let childTag01 = tagSut.getChildTag(tag01);

    let tag02 = new Tag('tag02');
    tag02 = tagSut.saveTag(tag02);
    let childTag02 = tagSut.getChildTag(tag02);

    let ideaTopic = 'T01.01.03.1.3.1';

    let idea01 = new Idea(ideaTopic);
    idea01.tags = [childTag01, childTag02];
    idea01 = ideaSut.saveIdea(idea01);
    let idea01Id = idea01.id;

    let idea02 = new Idea(ideaTopic);
    idea02.id = idea01Id;
    idea02.tags = [];
    idea02 = ideaSut.saveIdea(idea02);

    expect(db.ideaDbLength).toBe(1);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.tags.length).toEqual(2);
    expect(ideaUt02.tags.length).toEqual(2);
  });

  it('T01.01.03.1.3.2 When Saving an idea Given a new Tag Should add new tag', () => {
    let tag01 = new Tag('tag01');
    tag01 = tagSut.saveTag(tag01);
    let childTag01 = tagSut.getChildTag(tag01);

    let tag02 = new Tag('tag02');
    tag02 = tagSut.saveTag(tag02);
    let childTag02 = tagSut.getChildTag(tag02);

    let tag03 = new Tag('tag03');
    tag03 = tagSut.saveTag(tag03);
    let childTag03 = tagSut.getChildTag(tag03);

    let ideaTopic = 'T01.01.03.1.3.2';

    let idea01 = new Idea(ideaTopic);
    idea01.tags = [childTag01, childTag02];
    idea01 = ideaSut.saveIdea(idea01);
    let idea01Id = idea01.id;

    let idea02 = new Idea(ideaTopic);
    idea02.id = idea01Id;
    idea02.tags = [childTag03];
    idea02 = ideaSut.saveIdea(idea02);

    expect(db.ideaDbLength).toBe(1);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.tags.length).toEqual(3);
    expect(ideaUt02.tags.length).toEqual(3);
  });

  it('T01.01.03.1.3.3 When Saving an idea Given a Tag being removed Should remove the tag', () => {
    let tag01 = new Tag('tag01');
    tag01 = tagSut.saveTag(tag01);
    let childTag01 = tagSut.getChildTag(tag01);

    let tag02 = new Tag('tag02');
    tag02 = tagSut.saveTag(tag02);
    let childTag02 = tagSut.getChildTag(tag02);

    let ideaTopic = 'T01.01.03.1.3.3';

    let idea01 = new Idea(ideaTopic);
    idea01.tags = [childTag01, childTag02];
    idea01 = ideaSut.saveIdea(idea01);
    let idea01Id = idea01.id;

    idea01 = ideaSut.removeTagRelationship(idea01, tag01.id);

    expect(db.ideaDbLength).toBe(1);

    let ideaUt01 = db.getIdeaByTopic(ideaTopic);
    let ideaUt02 = db.getIdeaById(idea01Id);

    expect(ideaUt01.tags.length).toEqual(1);
    expect(ideaUt02.tags.length).toEqual(1);
  });

  it('T01.01.04.1 When Saving an Idea Given Parents Should create the Parents first, otherwise throw an exception', () => {
    let idea = new Idea('topic-1234656');
    idea.id = 0;

    let parent = new ChildIdea();
    parent.topic = 'parent01';

    idea.parents = [parent];

    expect(function () {
      ideaSut.saveIdea(idea);
    }).toThrow(new Error(`All parents must have id.`));

    parent.id = 456465;
    idea.parents = [parent];
    expect(function () {
      ideaSut.saveIdea(idea);
    }).toThrow(new Error(`All parents must have id.`));
  });

  it('T01.01.04.2 When Saving an Idea Given Child Concepts Should create the Concept first, otherwise throw an exception', () => {
    let idea = new Idea('topic-1234656');
    idea.id = 0;

    let concept = new Concept();

    concept.content = 'content01';

    idea.concepts = [concept];

    expect(function () {
      ideaSut.saveIdea(idea);
    }).toThrow(new Error(`All child concepts must have id.`));

    idea.id = 456465;
    idea.concepts = [concept];
    expect(function () {
      ideaSut.saveIdea(idea);
    }).toThrow(new Error(`All child concepts must have id.`));
  });

  it('T01.01.04.3 When Saving an Idea Given Child Tags Should create the Tags first, otherwise throw an exception', () => {
    let idea = new Idea('topic-1234656');
    idea.id = 0;

    let tag = new ChildTag();
    tag.name = 'tag01';

    idea.tags = [tag];

    expect(function () {
      ideaSut.saveIdea(idea);
    }).toThrow(new Error(`All tags must have id.`));

    tag.id = 456465;
    idea.tags = [tag];
    expect(function () {
      ideaSut.saveIdea(idea);
    }).toThrow(new Error(`All tags must have id.`));
  });

  it('T03.06.1 When Changing the Topic Name Given New Topic Should update Idea Topic', () => {
    let topicName = 'topic01';
    let newTopicName = 'topic01-Updated';

    let idea = new Idea(topicName);
    idea = ideaSut.saveIdea(idea);
    let ideaId = idea.id;

    expect(db.ideaDbLength).toBe(1);

    ideaSut.changeTopicName(idea, newTopicName);

    let ideaUt = db.getIdeaById(ideaId);
    expect(ideaUt.topic).toEqual(newTopicName);
  });

  it('T03.06.2 When Saving an Idea Given a New Topic Should not update the Idea Topic', () => {
    let idea01 = new Idea('00000001');
    ideaSut.saveIdea(idea01);

    let idea02 = new Idea('00000002');
    ideaSut.saveIdea(idea02);

    const topic = 'topic-1234656';
    const topicUpdated = 'topic-1234656+update it';
    let idea = new Idea(topic);
    idea.isUrgent = false;
    idea.status = 5;
    idea.id = 0;
    idea = ideaSut.saveIdea(idea);

    let ideaId = idea.id;

    let idea2 = new Idea(topicUpdated);
    idea2.id = idea.id;

    idea2.isUrgent = true;
    idea2.status = 6;
    idea2.type = 6;
    ideaSut.saveIdea(idea2); // saving a new one with the topic

    expect(db.flagIdeaExistById(ideaId)).toBeTrue();

    let existingIdea = db.getIdeaById(ideaId);

    expect(existingIdea.topic).toEqual(topic); // <-- topic must still the same
    expect(existingIdea.isUrgent).toBeTrue();
    expect(existingIdea.status).toEqual(6);
    expect(existingIdea.type).toEqual(6);
  });

  it('Should remove an Idea from the database', () => {
    let idea = new Idea('topic01');
    ideaSut.saveIdea(idea);

    expect(db.ideaDbLength).toEqual(1);
    expect(db.flagIdeaExistById(idea.id)).toBeTrue();
    expect(db.flagIdeaExistByTopic(idea.topic)).toBeTrue();

    ideaSut.removeIdea(idea);

    expect(db.flagIdeaExistById(idea.id)).toBeFalse();
    expect(db.flagIdeaExistByTopic(idea.topic)).toBeFalse();
  });

  it('T04.01.02 When Changing the Idea Topic Should update all Concept relationships', () => {
    const ideaTopic = 'compras';
    const newIdeaTopic = 'compras en la farmacia';
    let idea = new Idea(ideaTopic);
    idea.isUrgent = false;

    idea = ideaSut.saveIdea(idea);

    let concept01 = new Concept('Comprar Tylenol');
    concept01.parents.push(idea);
    conceptSut.saveConcept(concept01);

    let concept02 = new Concept('Comprar Aspirina');
    concept02.parents.push(idea);
    conceptSut.saveConcept(concept02);

    let newConcept01a = db.getConceptById(concept01.id);
    let newConcept02a = db.getConceptById(concept02.id);

    expect(newConcept01a.parents[0].topic)
      .withContext('The parent Idea asociado debe existir en el Concepto #1')
      .toBe(ideaTopic);
    expect(newConcept02a.parents[0].topic)
      .withContext('The parent Idea asociado debe existir en el Concepto #2')
      .toBe(ideaTopic);

    ideaSut.changeTopicName(idea, newIdeaTopic);

    let newConcept01b = db.getConceptById(concept01.id);
    let newConcept02b = db.getConceptById(concept02.id);

    expect(newConcept01b.parents[0].topic)
      .withContext('The parent Idea actualizado debe existir en el Concepto #1')
      .toBe(newIdeaTopic);
    expect(newConcept02b.parents[0].topic)
      .withContext(
        'The parent Idea actualizado debe existir en el Concepto #2.'
      )
      .toBe(newIdeaTopic);
  });

  it('T04.02.03 When Changing the Idea Topic Should update all Tag relationships', () => {
    let topic = 'Comprar Tylenol';
    let newTopic = 'Comprar Tylenol PM';

    let idea01 = new Idea(topic);
    ideaSut.saveIdea(idea01);

    let tag01 = new Tag('toBuy');
    tag01.ideas.push(idea01);
    tagSut.saveTag(tag01);

    let tag02 = new Tag('atTheDrugstore');
    tag02.ideas.push(idea01);
    tagSut.saveTag(tag02);

    let newTag01a = db.getTagById(tag01.id);
    let newTag02a = db.getTagById(tag02.id);

    expect(newTag01a.ideas[0].topic)
      .withContext('El concepto asociado d  ebe existir en la Tag #1')
      .toBe(topic);
    expect(newTag02a.ideas[0].topic)
      .withContext('El concept asociado debe existir en la Tag #2')
      .toBe(topic);

    idea01 = ideaSut.changeTopicName(idea01, newTopic);

    newTag01a = db.getTagById(tag01.id);
    newTag02a = db.getTagById(tag02.id);

    expect(newTag01a.ideas[0].topic)
      .withContext('El concepto actualizado debe existir en la Tag #1')
      .toBe(newTopic);
    expect(newTag02a.ideas[0].topic)
      .withContext('El concept actualizado debe existir en la Idea #2')
      .toBe(newTopic);
  });
});
