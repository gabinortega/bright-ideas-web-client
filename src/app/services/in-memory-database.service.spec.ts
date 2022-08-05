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
    expect(service.ideaDbLength).toEqual(0);
    expect(service.tagDbLength).toEqual(0);
    expect(service.conceptDbLength).toEqual(0);

    /*
    expect(service.ideaHistory.length).toEqual(0);
    expect(service.tagHistory.length).toEqual(0);
    expect(service.tagKeywords.length).toEqual(0);
    expect(service.conceptLastId).toEqual(0);
    */
  });
});
