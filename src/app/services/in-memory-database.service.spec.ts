import { TestBed } from '@angular/core/testing';

import { InMemoryDatabaseService } from './in-memory-database.service';

describe('InMemoryDatabaseService', () => {
  let service: InMemoryDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemoryDatabaseService);
  });

  it('InMemoryDatabase service should be created', () => {
    expect(service).toBeTruthy();
  });

  it('InMemoryDatabase service should initialize with no data', () => {
    expect(service.ideaIdMap.keys.length).toEqual(0);
    expect(service.ideaTopicMap.keys.length).toEqual(0);

    expect(service.tagIdMap.keys.length).toEqual(0);
    expect(service.tagNameMap.keys.length).toEqual(0);

    expect(service.conceptIdMap.keys.length).toEqual(0);
    expect(service.tagLastId).toEqual(0);
    expect(service.conceptHistory.length).toEqual(0);
    expect(service.ideaHistory.length).toEqual(0);
    expect(service.tagHistory.length).toEqual(0);
    expect(service.tagKeywords.length).toEqual(0);
    expect(service.conceptLastId).toEqual(0);
    expect(service.ideaLastId).toEqual(0);
  });
});
