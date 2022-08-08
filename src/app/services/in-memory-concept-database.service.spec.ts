import { ChildConcept } from './../shared/concept';
import { TestBed } from '@angular/core/testing';
import { Concept } from '../shared/concept';

import { InMemoryDatabaseService } from './in-memory-database.service';
import { InMemoryConceptDatabaseService } from './in-memory-concept-database.service';
import { ChildTag, Tag } from '../shared/tag';
import { ChildIdea, Idea } from '../shared/idea';
import { InMemoryIdeaDatabaseService } from './in-memory-idea-database.service';
import { InMemoryTagDatabaseService } from './in-memory-tag-database.service';

describe('InMemoryConceptDatabaseService', () => {
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

  it('InMemoryConceptDatabase service should be created', () => {
    expect(db).toBeTruthy();
  });

  it('T01.02.1 should increase every time a concept is saved', () => {
    let concept01 = new Concept();
    concept01.content = 'concept01';
    conceptSut.saveConcept(concept01);

    expect(db.conceptDbLength).toEqual(1);

    let concept02 = new Concept();
    concept02.content = 'concept02';
    conceptSut.saveConcept(concept02);

    expect(db.conceptDbLength).toBe(2);

    let concept03 = new Concept();
    concept03.content = 'concept03';
    conceptSut.saveConcept(concept02, true);

    expect(db.conceptDbLength).toBe(3);
  });

  it('T01.02.1 should save the concept in the database after save it', () => {
    const content = 'content03';
    let concept = new Concept();

    concept.content = content;
    conceptSut.saveConcept(concept);

    expect(db.flagConceptExistByContent(content)).toBeTrue();
  });

  it('T01.02.1.1 When saving a Concept Given an existing id Should update an existing Concept', () => {
    let concept01 = new Concept();
    concept01.content = '00000001';
    conceptSut.saveConcept(concept01);

    let concept02 = new Concept();
    concept02.content = '00000002';
    conceptSut.saveConcept(concept02);

    const content = 'content-1234656';
    const contentUpdated = 'content-1234656+update it';
    let concept = new Concept();
    concept.content = content;
    concept.isUrgent = false;
    concept.isImportant = false;
    concept.priorityOrder = 5;
    concept.status = 5;
    concept.type = 5;
    concept.id = 0;
    conceptSut.saveConcept(concept);

    let conceptId = concept.id;

    let concept03 = new Concept(); // creating a new Concept
    concept03.id = concept.id; // using an existing id
    concept03.content = contentUpdated;
    concept03.isUrgent = true;
    concept03.isImportant = true;
    concept03.priorityOrder = 6;
    concept03.status = 6;
    concept03.type = 6;
    conceptSut.saveConcept(concept03); // saving the new Concept using an existing id but different content

    expect(db.flagConceptExistById(conceptId)).toBeTrue();

    let existingConcept = db.getConceptById(conceptId);

    expect(existingConcept.content).toEqual(contentUpdated);
    expect(existingConcept.isUrgent).toBeTrue();
    expect(existingConcept.isImportant).toBeTrue();
    expect(existingConcept.priorityOrder).toEqual(6);
    expect(existingConcept.status).toEqual(6);
    expect(existingConcept.type).toEqual(6);
  });

  it('T01.02.1.2 When saving a Concept Given a not existing id Should throw an error', () => {
    const content = 'content-1234656';
    let concept = new Concept();
    concept.content = content;
    concept.isUrgent = false;
    concept.isImportant = false;
    concept.priorityOrder = 5;
    concept.status = 5;
    concept.type = 5;

    let conceptId = 454567; // <-- this id DOES NOT exist
    concept.id = conceptId;

    expect(function () {
      conceptSut.saveConcept(concept);
    }).toThrow(new Error(`A Concept with id ${conceptId} does not exist.`));

    expect(db.flagConceptExistById(conceptId)).toBeFalse();
  });

  it('T01.02.02.3.1 When saving a Concept Given force new Concept is set to True and the content exists Should create a new Concept', () => {
    const content = 'content-1234656';
    let concept1 = new Concept();
    concept1.content = content;
    concept1.isUrgent = false;
    concept1.isImportant = false;
    concept1.priorityOrder = 5;
    concept1.status = 5;
    concept1.type = 5;
    concept1.id = 0;
    conceptSut.saveConcept(concept1); // making sure it exists

    let concept2 = new Concept();
    concept2.content = content;
    concept2.isUrgent = true;
    concept2.isImportant = true;
    concept2.priorityOrder = 6;
    concept2.status = 6;
    concept2.type = 6;
    conceptSut.saveConcept(concept2, true); // saving a new one with the same content

    expect(db.conceptDbLength).toEqual(2);

    let conceptQueryResult = db.getConceptQueryByContent(content);

    expect(conceptQueryResult.length).toEqual(2);

    let firstConcept = conceptQueryResult[0];

    expect(firstConcept.isUrgent).toBeFalse();
    expect(firstConcept.isImportant).toBeFalse();
    expect(firstConcept.priorityOrder).toEqual(5);
    expect(firstConcept.status).toEqual(5);
    expect(firstConcept.type).toEqual(5);

    let secondContent = conceptQueryResult[1];

    expect(secondContent.isUrgent).toBeTrue();
    expect(secondContent.isImportant).toBeTrue();
    expect(secondContent.priorityOrder).toEqual(6);
    expect(secondContent.status).toEqual(6);
    expect(secondContent.type).toEqual(6);
  });

  it('T01.02.02.3.2 When saving a Concept Given force new Concept is set to True and the content does not exist Should create a new Concept', () => {
    const content = 'content03';

    let concept = new Concept();

    concept.content = content;
    conceptSut.saveConcept(concept, true);

    expect(db.flagConceptExistByContent(content)).toBeTrue();
  });

  it('T01.02.02.1.1 When saving a Concept Given no Id but an existing content Should update an existing Concept', () => {
    const content = 'content-1234656';
    let concept1 = new Concept();
    concept1.content = content;
    concept1.isUrgent = false;
    concept1.isImportant = false;
    concept1.priorityOrder = 5;
    concept1.status = 5;
    concept1.type = 5;
    concept1.id = 0;
    conceptSut.saveConcept(concept1); // making sure it exists

    let concept2 = new Concept();
    concept2.content = content;
    concept2.isUrgent = true;
    concept2.isImportant = true;
    concept2.priorityOrder = 6;
    concept2.status = 6;
    concept2.type = 6;
    conceptSut.saveConcept(concept2); // saving a new one with the same content

    expect(db.conceptDbLength).toEqual(1);

    expect(db.flagConceptExistByContent(content)).toBeTrue();

    let existingContent = db.getConceptQueryByContent(content)[0];

    expect(existingContent.isUrgent).toBeTrue();
    expect(existingContent.isImportant).toBeTrue();
    expect(existingContent.priorityOrder).toEqual(6);
    expect(existingContent.status).toEqual(6);
    expect(existingContent.type).toEqual(6);
  });

  it('T01.02.02.1.2 When saving a Concept Given no Id but an existing content Should update an existing Concept (trim)', () => {
    const content = 'content-1234656';
    let concept1 = new Concept();
    concept1.content = content;
    concept1.isUrgent = false;
    concept1.isImportant = false;
    concept1.priorityOrder = 5;
    concept1.status = 5;
    concept1.type = 5;
    concept1.id = 0;
    conceptSut.saveConcept(concept1); // making sure it exists

    let concept2 = new Concept();
    concept2.content =
      '   ' +
      content +
      `


    `; // <- spaces and return carriage
    concept2.isUrgent = true;
    concept2.isImportant = true;
    concept2.priorityOrder = 6;
    concept2.status = 6;
    concept2.type = 6;
    conceptSut.saveConcept(concept2); // saving a new one with the same content plus spaces, plus returns

    expect(db.conceptDbLength).toEqual(1);

    expect(db.flagConceptExistByContent(content)).toBeTrue();

    let existingContent = db.getConceptQueryByContent(content)[0];

    expect(existingContent.isUrgent).toBeTrue();
    expect(existingContent.isImportant).toBeTrue();
    expect(existingContent.priorityOrder).toEqual(6);
    expect(existingContent.status).toEqual(6);
    expect(existingContent.type).toEqual(6);
  });

  it('T01.02.02.2 When saving a Concept Given no Id and not existing content Should create a new Concept', () => {
    const content = 'content03';

    let concept = new Concept();

    concept.content = content;
    conceptSut.saveConcept(concept);

    expect(db.flagConceptExistByContent(content)).toBeTrue();
  });

  it('T01.02.03.2.1.1 When Saving a Concept Given an Idea parent being removed should not remove the Idea parent', () => {
    let ideaParent01 = new Idea('parent01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);
    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('parent02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);
    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let conceptContent = 'T01.02.03.2.1.1';

    // save a concept with two parents
    let concept01 = new Concept();
    concept01.content = conceptContent;
    concept01.parents = [childIdea01, childIdea02];
    concept01 = conceptSut.saveConcept(concept01);
    let concept01Id = concept01.id;

    let concept02 = db.getConceptById(concept01Id);
    concept02.parents = [];
    conceptSut.saveConcept(concept02);

    expect(db.conceptDbLength)
      .withContext(
        'Only one concept has been created, the same concept was updated. Querying Mapping by Id'
      )
      .toBe(1);

    let conceptQueryResult = db.getConceptQueryByContent(conceptContent);

    expect(conceptQueryResult.length)
      .withContext(
        'Only one concept has been created, the same concept was updated. Querying Mapping by Content'
      )
      .toBe(1);

    let ideaUt01 = conceptQueryResult[0];
    let ideaUt02 = db.getConceptById(concept01Id);

    expect(ideaUt01.parents.length)
      .withContext('One parent left, one parent remove on Mapping by Content')
      .toEqual(2);
    expect(ideaUt02.parents.length)
      .withContext('One parent left, one parent remove on Mapping by Id')
      .toEqual(2);
  });

  it('T01.02.03.2.1.2 When Saving a Concept Given a new Idea parent Should add new Idea parent', () => {
    let ideaParent01 = new Idea('parent01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);
    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('parent02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);
    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let ideaParent03 = new Idea('parent03');
    ideaParent03 = ideaSut.saveIdea(ideaParent03);
    let childIdea03 = ideaSut.getChildIdea(ideaParent03);

    let conceptContent = 'T01.02.03.2.1.2';

    let concept01 = new Concept();
    concept01.content = conceptContent;
    concept01.parents = [childIdea01, childIdea02];
    concept01 = conceptSut.saveConcept(concept01);
    let concept01Id = concept01.id;

    let concept02 = new Concept();
    concept02.id = concept01Id;
    concept02.content = conceptContent;
    concept02.parents = [childIdea03];
    concept02 = conceptSut.saveConcept(concept02);

    expect(db.conceptDbLength).toBe(1);

    let conceptQueryResult = db.getConceptQueryByContent(conceptContent);

    expect(conceptQueryResult.length).toEqual(1);

    let ideaUt01 = conceptQueryResult[0];
    let ideaUt02 = db.getConceptById(concept01Id);

    expect(ideaUt01.parents.length).toEqual(3);
    expect(ideaUt02.parents.length).toEqual(3);
  });

  it('T01.02.03.2.1.3 When Removing Ideas from Concept Should Remove the Idea', () => {
    let ideaParent01 = new Idea('parent01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);
    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('parent02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);
    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let conceptContent = 'T01.02.03.2.1.3';

    let concept01 = new Concept();
    concept01.content = conceptContent;
    concept01.parents = [childIdea01, childIdea02];

    // save a concept with two parents
    concept01 = conceptSut.saveConcept(concept01);

    // confirm the concept is saved
    expect(db.conceptDbLength)
      .withContext('Only one Concept should have been saved into the Database')
      .toBe(1);

    // remove one parent relationship
    concept01 = conceptSut.removeParentRelationship(concept01, ideaParent02.id);

    let concept01Id = concept01.id;
    expect(db.conceptDbLength)
      .withContext(
        'Only one Concept should have been saved into the Database on Mapping by Id List'
      )
      .toBe(1);

    // new db query
    let conceptQueryResult = db.getConceptQueryByContent(conceptContent);

    expect(conceptQueryResult.length)
      .withContext(
        'Only one Concept should have been saved into the Database on Mapping by Content List'
      )
      .toEqual(1);

    let ideaUt01 = conceptQueryResult[0];
    let ideaUt02 = db.getConceptById(concept01Id);

    expect(ideaUt01.parents.length)
      .withContext(
        'After removing the Parent Idea, Concept Map by Content should have only one parent.'
      )
      .toBe(1);

    expect(ideaUt02.parents.length)
      .withContext(
        'After removing the Child Idea, Concept Map by Id should have only one parent.'
      )
      .toBe(1);
  });

  it('T01.02.03.2.3.1 When Saving a Concept Given a Tag being removed should not remove the tag', () => {
    let tag01 = new Tag('tag01');
    tag01 = tagSut.saveTag(tag01);
    let childTag01 = tagSut.getChildTag(tag01);

    let tag02 = new Tag('tag02');
    tag02 = tagSut.saveTag(tag02);
    let childTag02 = tagSut.getChildTag(tag02);

    let conceptContent = 'T01.07.1 and T01.07.2';

    let concept01 = new Concept();
    concept01.content = conceptContent;
    concept01.tags = [childTag01, childTag02];
    // create a concept
    concept01 = conceptSut.saveConcept(concept01);
    let concept01Id = concept01.id;

    let concept02 = new Concept();
    concept02.id = concept01Id;
    concept02.content = conceptContent;
    concept02.tags = [];
    // update the concept removing all ids
    concept02 = conceptSut.saveConcept(concept02);

    let conceptQueryResult = db.getConceptQueryByContent(conceptContent);

    // making sure only one concept is saved in the database
    expect(db.conceptDbLength)
      .withContext(
        'Only one Concept should have been saved into the Database on Mapping by Id List'
      )
      .toBe(1);
    expect(conceptQueryResult.length)
      .withContext(
        'Only one Concept should have been saved into the Database on Mapping by Content List'
      )
      .toEqual(1);

    let ideaUt01 = conceptQueryResult[0];
    let ideaUt02 = db.getConceptById(concept01Id);

    expect(ideaUt01.tags.length)
      .withContext(
        'Should not removed any tags from Concept Map by Content  List.'
      )
      .toBe(2);
    expect(ideaUt02.tags.length)
      .withContext('Should not removed any tags from Concept Map by Id  List.')
      .toBe(2);
  });

  it('T01.02.03.2.3.2 When Saving a Concept Given a new Tag Should add new parent', () => {
    let tag01 = new Tag('tag01');
    tag01 = tagSut.saveTag(tag01);
    let childTag01 = tagSut.getChildTag(tag01);

    let tag02 = new Tag('tag02');
    tag02 = tagSut.saveTag(tag02);
    let childTag02 = tagSut.getChildTag(tag02);

    let tag03 = new Tag('tag03');
    tag03 = tagSut.saveTag(tag03);
    let childTag03 = tagSut.getChildTag(tag03);

    let conceptContent = 'T01.07.1 and T01.07.2';

    let concept01 = new Concept();
    concept01.content = conceptContent;
    concept01.tags = [childTag01, childTag02];
    concept01 = conceptSut.saveConcept(concept01);
    let concept01Id = concept01.id;

    let concept02 = new Concept();
    concept02.id = concept01Id;
    concept02.content = conceptContent;
    concept02.tags = [childTag03];
    concept02 = conceptSut.saveConcept(concept02);

    expect(db.conceptDbLength).toBe(1);

    let conceptQueryResult = db.getConceptQueryByContent(conceptContent);

    expect(conceptQueryResult.length).toEqual(1);

    let ideaUt01 = conceptQueryResult[0];
    let ideaUt02 = db.getConceptById(concept01Id);

    expect(ideaUt01.tags.length).toEqual(3);
    expect(ideaUt02.tags.length).toEqual(3);
  });

  it('T01.02.03.2.3.1 When Saving a Concept Given a Tag being removed should not remove the tag', () => {
    let tag01 = new Tag('tag01');
    tag01 = tagSut.saveTag(tag01);
    let childTag01 = tagSut.getChildTag(tag01);

    let tag02 = new Tag('tag02');
    tag02 = tagSut.saveTag(tag02);
    let childTag02 = tagSut.getChildTag(tag02);

    let conceptContent = 'T01.07.1 and T01.07.2';

    let concept01 = new Concept();
    concept01.content = conceptContent;
    concept01.tags = [childTag01, childTag02];
    concept01 = conceptSut.saveConcept(concept01);
    let concept01Id = concept01.id;

    concept01 = conceptSut.removeTagRelationship(concept01, tag02.id);

    expect(db.conceptDbLength).toBe(1);

    let conceptQueryResult = db.getConceptQueryByContent(conceptContent);

    expect(conceptQueryResult.length).toEqual(1);

    let ideaUt01 = conceptQueryResult[0];
    let ideaUt02 = db.getConceptById(concept01Id);

    expect(ideaUt01.tags.length).toEqual(1);
    expect(ideaUt02.tags.length).toEqual(1);
  });

  it('T01.02.04.1 When Saving a Concept Given Child Tags Should create the Tags first, otherwise throw an exception', () => {
    let concept = new Concept();
    concept.id = 0;
    concept.content = 'content-1234656';

    let tag = new ChildTag();
    tag.name = 'tag01';

    concept.tags = [tag];

    expect(function () {
      conceptSut.saveConcept(concept);
    }).toThrow(new Error(`All Tags must have id.`));

    tag.id = 456465;
    concept.tags = [tag];
    expect(function () {
      conceptSut.saveConcept(concept);
    }).toThrow(new Error(`All Tags must have id.`));
  });

  it('T01.02.04.2 When Saving a Concept Given a Parent Idea Should create the Parent Idea first, otherwise throw an exception', () => {
    let concept = new Concept();
    concept.id = 0;
    concept.content = 'content-1234656';

    let parent = new ChildIdea();
    parent.topic = 'topic01';

    concept.parents = [parent];

    expect(function () {
      conceptSut.saveConcept(concept);
    }).toThrow(new Error(`All parent Ideas must have id.`));

    parent.id = 456465;
    concept.parents = [parent];
    expect(function () {
      conceptSut.saveConcept(concept);
    }).toThrow(new Error(`All parent Ideas must have id.`));
  });

  it('Should remove a Concept from the database', () => {
    let concept = new Concept('content');
    conceptSut.saveConcept(concept);

    expect(db.conceptDbLength).toEqual(1);
    expect(db.flagConceptExistById(concept.id)).toBeTrue();
    expect(db.flagConceptExistByContent(concept.content)).toBeTrue();

    conceptSut.removeConcept(concept);

    expect(db.flagConceptExistById(concept.id)).toBeFalse();

    expect(db.getConceptQueryByContent(concept.content).length).toBe(0);
  });

  it('T04.02.01 When Changing the Concept Topic Should update all Idea relationships', () => {
    let content = 'Comprar Tylenol';
    let newContent = 'Comprar Tylenol PM';

    let concept01 = new Concept(content);
    conceptSut.saveConcept(concept01);

    let idea01 = new Idea('toBuy');
    idea01.concepts.push(concept01);
    ideaSut.saveIdea(idea01);

    let idea02 = new Idea('atTheDrugstore');
    idea02.concepts.push(concept01);
    ideaSut.saveIdea(idea02);

    let newIdea01a = db.getIdeaById(idea01.id);
    let newIdea02a = db.getIdeaById(idea02.id);

    expect(newIdea01a.concepts[0].content)
      .withContext('El concepto asociado debe existir en la Idea #1')
      .toBe(content);
    expect(newIdea02a.concepts[0].content)
      .withContext('El concept asociado debe existir en la Idea #2')
      .toBe(content);

    concept01.content = newContent;
    conceptSut.saveConcept(concept01);

    newIdea01a = db.getIdeaById(idea01.id);
    newIdea02a = db.getIdeaById(idea02.id);

    expect(newIdea01a.concepts[0].content)
      .withContext('El concepto actualizado debe existir en la Idea #1')
      .toBe(newContent);
    expect(newIdea02a.concepts[0].content)
      .withContext('El concept actualizado debe existir en la Idea #2')
      .toBe(newContent);
  });

  it('T04.02.03 When Changing the Concept Topic Should update all Tag relationships', () => {
    let content = 'Comprar Tylenol';
    let newContent = 'Comprar Tylenol PM';

    let concept01 = new Concept(content);
    conceptSut.saveConcept(concept01);

    let tag01 = new Tag('toBuy');
    tag01.concepts.push(concept01);
    tagSut.saveTag(tag01);

    let tag02 = new Tag('atTheDrugstore');
    tag02.concepts.push(concept01);
    tagSut.saveTag(tag02);

    let newTag01a = db.getTagById(tag01.id);
    let newTag02a = db.getTagById(tag02.id);

    expect(newTag01a.concepts[0].content)
      .withContext('El concepto asociado d  ebe existir en la Tag #1')
      .toBe(content);
    expect(newTag02a.concepts[0].content)
      .withContext('El concept asociado debe existir en la Tag #2')
      .toBe(content);

    concept01.content = newContent;
    conceptSut.saveConcept(concept01);

    newTag01a = db.getTagById(tag01.id);
    newTag02a = db.getTagById(tag02.id);

    expect(newTag01a.concepts[0].content)
      .withContext('El concepto actualizado debe existir en la Tag #1')
      .toBe(newContent);
    expect(newTag02a.concepts[0].content)
      .withContext('El concept actualizado debe existir en la Idea #2')
      .toBe(newContent);
  });
});
