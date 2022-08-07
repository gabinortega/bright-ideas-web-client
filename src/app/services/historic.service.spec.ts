import { TestBed } from '@angular/core/testing';
import { Idea } from '../shared/idea';
import { HistoricService } from './historic.service';
import { InMemoryConceptDatabaseService } from './in-memory-concept-database.service';
import { InMemoryDatabaseService } from './in-memory-database.service';
import { InMemoryIdeaDatabaseService } from './in-memory-idea-database.service';
import { InMemoryTagDatabaseService } from './in-memory-tag-database.service';
import { Tag } from '../shared/tag';
import { Concept } from '../shared/concept';

describe('HistoricService', () => {
  let service: HistoricService;
  let db: InMemoryDatabaseService;
  let ideaSut: InMemoryIdeaDatabaseService;
  let tagSut: InMemoryTagDatabaseService;
  let conceptSut: InMemoryConceptDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistoricService);
    db = TestBed.inject(InMemoryDatabaseService);
    ideaSut = TestBed.inject(InMemoryIdeaDatabaseService);
    tagSut = TestBed.inject(InMemoryTagDatabaseService);
    conceptSut = TestBed.inject(InMemoryConceptDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create historic entries when updating Ideas', () => {
    let idea = new Idea('idea1');
    idea.priorityOrder = 11;
    idea.status = 11;
    idea.type = 11;
    ideaSut.saveIdea(idea);

    idea.isUrgent = false;
    idea.isImportant = false;
    idea.priorityOrder = 12;
    idea.status = 12;
    idea.type = 12;
    idea = ideaSut.saveIdea(idea);
    let queryResult = db.getIdeaHistory(idea.id);
    expect(queryResult.length).toBe(1);

    idea.isUrgent = true;
    idea.isImportant = true;
    idea.priorityOrder = 13;
    idea.status = 13;
    idea.type = 13;
    ideaSut.saveIdea(idea);

    queryResult = db.getIdeaHistory(idea.id);
    expect(queryResult.length).toBe(2);

    idea.priorityOrder = 14;
    idea.status = 14;
    idea.type = 14;
    ideaSut.saveIdea(idea);

    queryResult = db.getIdeaHistory(idea.id);
    expect(queryResult.length).toBe(3);

    expect(queryResult[0].status).toBe(11);
    expect(queryResult[1].status).toBe(12);
    expect(queryResult[2].status).toBe(13);
  });

  it('should create historic entries when updating Tags', () => {
    let tag = new Tag('idea1');
    tag = tagSut.saveTag(tag);

    tag.isUrgent = false;
    tag.isImportant = false;
    tag.priorityOrder = 5;
    tag = tagSut.saveTag(tag);
    expect(db.getTagHistory(tag.id).length).toBe(1);

    let ideaId = tag.id;

    tag.isUrgent = true;
    tag.isImportant = true;
    tag.priorityOrder = 6;
    tagSut.saveTag(tag);
    expect(db.getTagHistory(tag.id).length).toBe(2);

    tag.priorityOrder = 7;
    tagSut.saveTag(tag);
    expect(db.getTagHistory(tag.id).length).toBe(3);
  });

  it('should create historic entries when updating Concepts', () => {
    let concept = new Concept('idea1');
    concept = conceptSut.saveConcept(concept);

    concept.isUrgent = false;
    concept.isImportant = false;
    concept.priorityOrder = 5;
    concept = conceptSut.saveConcept(concept);
    expect(db.getConceptHistory(concept.id).length).toBe(1);

    let ideaId = concept.id;

    concept.isUrgent = true;
    concept.isImportant = true;
    concept.priorityOrder = 6;
    conceptSut.saveConcept(concept);
    expect(db.getConceptHistory(concept.id).length).toBe(2);

    concept.priorityOrder = 7;
    conceptSut.saveConcept(concept);
    expect(db.getConceptHistory(concept.id).length).toBe(3);
  });
});
