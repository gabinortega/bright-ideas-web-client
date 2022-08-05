import { TestBed } from '@angular/core/testing';
import { ChildConcept, Concept } from '../shared/concept';
import { ChildIdea, Idea } from '../shared/idea';
import { Tag } from '../shared/tag';
import { InMemoryConceptDatabaseService } from './in-memory-concept-database.service';
import { InMemoryDatabaseService } from './in-memory-database.service';
import { InMemoryIdeaDatabaseService } from './in-memory-idea-database.service';

import { InMemoryTagDatabaseService } from './in-memory-tag-database.service';

describe('InMemoryTagDatabaseService', () => {
  let db: InMemoryDatabaseService;
  let ideaSut: InMemoryIdeaDatabaseService;
  let tagSut: InMemoryTagDatabaseService;
  let conceptSut: InMemoryConceptDatabaseService;

  beforeEach(() => {
    // TestBed.configureTestingModule({});
    // db = new InMemoryDatabaseService();
    // ideaSut = new InMemoryIdeaDatabaseService(db);
    // tagSut = new InMemoryTagDatabaseService(db);
    // conceptSut = new InMemoryConceptDatabaseService(db);
    // db.clearDatabase();
    TestBed.configureTestingModule({});
    db = TestBed.inject(InMemoryDatabaseService);
    ideaSut = TestBed.inject(InMemoryIdeaDatabaseService);
    tagSut = TestBed.inject(InMemoryTagDatabaseService);
    conceptSut = TestBed.inject(InMemoryConceptDatabaseService);
  });

  it('InMemoryTagDatabase service should be created', () => {
    expect(db).toBeTruthy();
  });

  it('T03.01 Should increase every time a Tag is saved', () => {
    let tag01 = new Tag('tag01');
    tagSut.saveTag(tag01);

    expect(db.tagDbLength).toEqual(1);

    let tag02 = new Tag('tag02');
    tagSut.saveTag(tag02);

    expect(db.tagDbLength).toEqual(2);
  });

  it('T03.01 Should save the Tag in the database after save it', () => {
    let tag01Name = 'tag01';
    let tag01 = new Tag(tag01Name);
    tagSut.saveTag(tag01);

    expect(db.tagExistByName(tag01Name)).toBeTrue();
  });

  it('T03.01.1 When saving a Tag Given an existing id Should update an existing Tag', () => {
    let tag01 = new Tag('00000001');
    tagSut.saveTag(tag01);

    let tag02 = new Tag('00000002');
    tagSut.saveTag(tag02);

    const name = 'name-1234656';
    const nameUpdated = 'name-1234656+update it';
    let tag = new Tag(name);
    tag.isUrgent = false;
    tag.isImportant = false;
    tag.priorityOrder = 5;
    tag.id = 0;
    tagSut.saveTag(tag);

    let tagId = tag.id;

    let tag03 = new Tag(nameUpdated);
    tag03.id = tag.id;
    tag03.isUrgent = true;
    tag03.isImportant = true;
    tag03.priorityOrder = 6;
    tagSut.saveTag(tag03); // saving a new one with the same name

    expect(db.tagExistById(tagId)).toBeTrue();

    let existingTag: any = db.getTagById(tagId);

    expect(existingTag.name).toEqual(name); // <-- we are not going to update the name here
    expect(existingTag.isUrgent).toBeTrue();
    expect(existingTag.isImportant).toBeTrue();
    expect(existingTag.priorityOrder).toEqual(6);
  });

  it('T03.01.2 When saving a Tag Given a not existing id Should throw an error', () => {
    const name = 'name-1234656';
    let tag = new Tag(name);
    tag.isUrgent = false;
    tag.isImportant = false;
    tag.priorityOrder = 5;

    let ideaId = 454567; // <-- this id DOES NOT exist
    tag.id = ideaId;

    expect(function () {
      tagSut.saveTag(tag);
    }).toThrow(new Error(`A Tag with id ${ideaId} does not exist.`));

    expect(db.ideaExistById(ideaId)).toBeFalse();
  });

  it('T03.02.1.1 When saving a Tag Given no Id but and existing name Should update an existing Tag', () => {
    const name = 'name-1234656';
    let tag1 = new Tag(name);
    tag1.isUrgent = false;
    tag1.isImportant = false;
    tag1.priorityOrder = 5;
    tag1.id = 0;
    tagSut.saveTag(tag1); // making sure it exists

    let tag2 = new Tag(name);
    tag2.isUrgent = true;
    tag2.isImportant = true;
    tag2.priorityOrder = 6;
    tagSut.saveTag(tag2); // saving a new one with the same name

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(name)).toBeTrue();

    let existingTag: any = db.getTagByName(name);

    expect(existingTag.isUrgent).toBeTrue();
    expect(existingTag.isImportant).toBeTrue();
    expect(existingTag.priorityOrder).toEqual(6);
  });

  it('T03.02.1.2 When saving a Tag Given no Id but and existing name Should update an existing Tag (trim)', () => {
    const name = 'name-1234656';
    let tag1 = new Tag(name);
    tag1.isUrgent = false;
    tag1.isImportant = false;
    tag1.priorityOrder = 5;
    tag1.id = 0;
    tagSut.saveTag(tag1); // making sure it exists

    let tag2name =
      '   ' +
      name +
      `


   `; // <- spaces and return carriage
    let tag2 = new Tag(tag2name);

    tag2.isUrgent = true;
    tag2.isImportant = true;
    tag2.priorityOrder = 6;
    tagSut.saveTag(tag2); // saving a new one with the same name plus spaces, plus returns

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(name)).toBeTrue();

    let existingTag: any = db.getTagByName(name);

    expect(existingTag.isUrgent).toBeTrue();
    expect(existingTag.isImportant).toBeTrue();
    expect(existingTag.priorityOrder).toEqual(6);
  });

  it('T03.02.2 When saving a Tag Given no Id and not existing topic Should create a new Tag', () => {
    let tag01Name = 'tag01';
    let tag01 = new Tag(tag01Name);
    tagSut.saveTag(tag01);

    expect(db.tagExistByName(tag01Name)).toBeTrue();
  });

  it('T03.03.3.1.1 When Saving a Tag Given an Idea being removed should not remove the idea', () => {
    let ideaParent01 = new Idea('parent01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);
    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('parent02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);
    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.ideas = [childIdea01, childIdea02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    let tag02 = new Tag(tagName);
    tag02.id = tag01Id;
    tag02.ideas = [];
    tag02 = tagSut.saveTag(tag02);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();
    expect(db.tagExistById(tag01Id)).toBeTrue();

    let tagResult01: any = db.getTagByName(tagName);
    let tagResult02: any = db.getTagById(tag01Id);

    expect(tagResult01.ideas.length).toEqual(2);
    expect(tagResult02.ideas.length).toEqual(2);
  });

  it('T03.03.3.1.2 When Saving a Tag Given an new Idea Should add new idea', () => {
    let ideaParent01 = new Idea('parent01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);
    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('parent02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);
    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let ideaParent03 = new Idea('parent03');
    ideaParent03 = ideaSut.saveIdea(ideaParent03);
    let childIdea03 = ideaSut.getChildIdea(ideaParent03);

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.ideas = [childIdea01, childIdea02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    let tag02 = new Tag(tagName);
    tag02.id = tag01Id;
    tag02.ideas = [childIdea03];
    tag02 = tagSut.saveTag(tag02);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();

    let ideaUt01: any = db.getTagByName(tagName);
    let ideaUt02: any = db.getTagById(tag01Id);

    expect(ideaUt01.ideas.length).toEqual(3);
    expect(ideaUt02.ideas.length).toEqual(3);
  });

  it('T03.03.3.1.3 When Removing Ideas from Tag Should Remove the Idea', () => {
    let ideaParent01 = new Idea('idea01');
    ideaParent01 = ideaSut.saveIdea(ideaParent01);
    let childIdea01 = ideaSut.getChildIdea(ideaParent01);

    let ideaParent02 = new Idea('idea02');
    ideaParent02 = ideaSut.saveIdea(ideaParent02);
    let childIdea02 = ideaSut.getChildIdea(ideaParent02);

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.ideas = [childIdea01, childIdea02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    tag01 = tagSut.removeIdeaRelationship(tag01, childIdea01.id);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();
    expect(db.tagExistById(tag01Id)).toBeTrue();

    let tagResult01: any = db.getTagByName(tagName);
    let tagResult02: any = db.getTagById(tag01Id);

    expect(tagResult01.ideas.length).toEqual(1);
    expect(tagResult02.ideas.length).toEqual(1);
  });

  it('T03.03.3.2.1 When Saving a Tag Given a Concept being removed should not remove the concept', () => {
    let concept01 = new Concept();
    concept01.content = 'content01';
    concept01 = conceptSut.saveConcept(concept01);

    let concept02 = new Concept();
    concept02.content = 'content02';
    concept02 = conceptSut.saveConcept(concept02);

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.concepts = [concept01, concept02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    let tag02 = new Tag(tagName);
    tag02.id = tag01Id;
    tag02.concepts = [];
    tag02 = tagSut.saveTag(tag02);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();

    let ideaUt01 = db.getTagByName(tagName);
    let ideaUt02 = db.getTagById(tag01Id);

    expect(ideaUt01.concepts.length).toEqual(2);
    expect(ideaUt02.concepts.length).toEqual(2);
  });

  it('T03.03.3.2.2 When Saving a Tag Given a new Concept Should add new concept', () => {
    let concept01 = new Concept();
    concept01.content = 'content01';
    concept01 = conceptSut.saveConcept(concept01);

    let concept02 = new Concept();
    concept02.content = 'content02';
    concept02 = conceptSut.saveConcept(concept02);

    let concept03 = new Concept();
    concept03.content = 'content03';
    concept03 = conceptSut.saveConcept(concept03);

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.concepts = [concept01, concept02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    let tag02 = new Tag(tagName);
    tag02.id = tag01Id;
    tag02.concepts = [concept03];
    tag02 = tagSut.saveTag(tag02);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();

    let ideaUt01 = db.getTagByName(tagName);
    let ideaUt02 = db.getTagById(tag01Id);

    expect(ideaUt01.concepts.length).toEqual(3);
    expect(ideaUt02.concepts.length).toEqual(3);
  });

  it('T03.03.3.2.3 When Saving a Tag Given a Concept being removed should remove the concept', () => {
    let concept01 = new Concept();
    concept01.content = 'content01';
    concept01 = conceptSut.saveConcept(concept01);

    let concept02 = new Concept();
    concept02.content = 'content02';
    concept02 = conceptSut.saveConcept(concept02);

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.concepts = [concept01, concept02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    tag01 = tagSut.removeConceptRelationship(tag01, concept01.id);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();

    let ideaUt01 = db.getTagByName(tagName);
    let ideaUt02 = db.getTagById(tag01Id);

    expect(ideaUt01.concepts.length).toEqual(1);
    expect(ideaUt02.concepts.length).toEqual(1);
  });

  it('T03.03.3.4.1 When Saving a Tag Given a keyword being removed should not remove the keyword', () => {
    let keyword01 = 'keyword01';
    let keyword02 = 'keyword02';

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.keywords = [keyword01, keyword02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    let tag02 = new Tag(tagName);
    tag02.id = tag01Id;
    tag02.keywords = [];
    tag02 = tagSut.saveTag(tag02);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();

    let ideaUt01 = db.getTagByName(tagName);
    let ideaUt02 = db.getTagById(tag01Id);

    expect(ideaUt01.keywords.length).toEqual(2);
    expect(ideaUt02.keywords.length).toEqual(2);
  });

  it('T03.03.3.4.2 When Saving a Tag Given an new keyword Should add new keyword', () => {
    let keyword01 = 'keyword01';
    let keyword02 = 'keyword02';
    let keyword03 = 'keyword03';

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.keywords = [keyword01, keyword02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    let tag02 = new Tag(tagName);
    tag02.id = tag01Id;
    tag02.keywords = [keyword03];
    tag02 = tagSut.saveTag(tag02);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();

    let ideaUt01 = db.getTagByName(tagName);
    let ideaUt02 = db.getTagById(tag01Id);

    expect(ideaUt01.keywords.length).toEqual(3);
    expect(ideaUt02.keywords.length).toEqual(3);
  });

  it('T03.03.3.4.3 When Saving a Tag Given a keyword being removed should remove the keyword', () => {
    let keyword01 = 'keyword01';
    let keyword02 = 'keyword02';

    let tagName = 'tagName01';

    let tag01 = new Tag(tagName);
    tag01.keywords = [keyword01, keyword02];
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    tag01 = tagSut.removeKeywordRelationship(tag01, keyword02);

    expect(db.tagDbLength).toEqual(1);

    expect(db.tagExistByName(tagName)).toBeTrue();

    let ideaUt01 = db.getTagByName(tagName);
    let ideaUt02 = db.getTagById(tag01Id);

    expect(ideaUt01.keywords.length).toEqual(1);
    expect(ideaUt02.keywords.length).toEqual(1);
  });

  it('T03.04.1 When Saving a Tag Given Child Concepts Should create the Concepts first, otherwise throw an exception', () => {
    let tag = new Tag('T01.13');
    tag.id = 0;

    let childConcept = new ChildConcept();
    childConcept.content = 'content01';

    tag.concepts = [childConcept];

    expect(function () {
      tagSut.saveTag(tag);
    }).toThrow(new Error(`All concepts must have id.`));

    childConcept.id = 456465;
    tag.concepts = [childConcept];
    expect(function () {
      tagSut.saveTag(tag);
    }).toThrow(new Error(`All concepts must have id.`));
  });

  it('T03.04.2 When Saving a Tag Given Child Ideas Should create the first, otherwise throw an exception', () => {
    let tag = new Tag('T01.19');
    tag.id = 0;

    let childIdea = new ChildIdea();
    childIdea.topic = 'topic01';

    tag.ideas = [childIdea];

    expect(function () {
      tagSut.saveTag(tag);
    }).toThrow(new Error(`All ideas must have id.`));

    childIdea.id = 456465;
    tag.ideas = [childIdea];
    expect(function () {
      tagSut.saveTag(tag);
    }).toThrow(new Error(`All ideas must have id.`));
  });

  it('T03.06.2 When Saving a Tag Given a New Tag Name Should not update the Tag Name', () => {
    let tagName = 'tagName01';
    let tagNameUpdated = 'tagName01-Updated';

    let tag01 = new Tag(tagName);
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    let tag02 = new Tag(tagNameUpdated);
    tag02.id = tag01Id;
    tag02 = tagSut.saveTag(tag02);

    let ideaUt = db.getTagById(tag01Id);

    expect(ideaUt.name).toEqual(tagName);
  });

  it('T03.06.1 When Changing the Tag Name Given New Name Should update Tag name', () => {
    let tagName = 'tagName01';
    let newTagName = 'tagName01-Updated';

    let tag01 = new Tag(tagName);
    tag01 = tagSut.saveTag(tag01);
    let tag01Id = tag01.id;

    expect(db.tagDbLength).toBe(1);

    tagSut.changeTagName(tag01, newTagName);

    let ideaUt = db.getTagById(tag01Id);

    expect(ideaUt.name).toEqual(newTagName);
  });

  it('T03.06.1 When Changing the Tag Name Given New Name Should not update Tag name', () => {
    const tagName = 'tag-1234656';
    const tagNameUpdated = 'tag-1234656+update it';
    let tag = new Tag(tagName);
    tag.isUrgent = false;
    tag.id = 0;
    tag = tagSut.saveTag(tag);

    let ideaId = tag.id;

    let tag2 = new Tag(tagNameUpdated);
    tag2.id = tag.id;
    tag2.isUrgent = true;
    tagSut.saveTag(tag2); // saving a new one with the same id and different tagName

    expect(db.tagExistById(ideaId)).toBeTrue();

    let existingTag = db.getTagById(ideaId);

    expect(existingTag.name).toEqual(tagName); // <-- tag must still the same
    expect(existingTag.isUrgent).toBeTrue();
  });

  it('Should remove a Tag from the database', () => {
    let tag = new Tag('tagName');
    tagSut.saveTag(tag);

    expect(db.tagDbLength).toEqual(1);
    expect(db.tagExistById(tag.id)).toBeTrue();
    expect(db.tagExistByName(tag.name)).toBeTrue();

    tagSut.removeTag(tag);

    expect(db.tagExistById(tag.id)).toBeFalse();
    expect(db.tagExistByName(tag.name)).toBeFalse();
  });
});
