import { Injectable } from '@angular/core';
import { InMemoryDatabaseService } from './in-memory-database.service';

@Injectable({
  providedIn: 'root',
})
export class HistoricService {
  saveIdea(ideaId: number): void {
    let idea = this.db.getIdeaById(ideaId);
    this.db.pushIdeaToHistoric(idea.id, idea);
  }
  saveConcept(conceptId: number): void {
    let concept = this.db.getConceptById(conceptId);
    this.db.pushConceptToHistoric(concept.id, concept);
  }
  saveTag(tagId: number): void {
    let tag = this.db.getTagById(tagId);
    this.db.pushTagToHistoric(tag.id, tag);
  }
  constructor(private db: InMemoryDatabaseService) {}
}
