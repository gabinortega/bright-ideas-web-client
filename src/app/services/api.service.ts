import { InMemoryDatabaseService } from './in-memory-database.service';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Inject, Injectable, isDevMode } from '@angular/core';
import { throwError } from 'rxjs';
import { IdeaForIndividualViewModel, TagRelationships } from '../shared/models';
import { Idea } from '../shared/idea';
import { Concept } from '../shared/concept';
import { ChildTag } from '../shared/tag';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string,
    private dbService: InMemoryDatabaseService
  ) {
    if (isDevMode()) {
      //this.baseUrl = environment.apiBaseUrl;
    }
  }

  public getRelationshipsFromDb(filterTagList: ChildTag[]): TagRelationships {
    let result = new TagRelationships();

    filterTagList.forEach((t) => {
      let tag = this.dbService.tags.find((x) => x.name == t.name);
      if (tag) {
        result.tags.push(tag);
      }
    });

    let ideas: { [id: number]: Idea } = {};

    result.tags.forEach((tag) => {
      tag.ideas.forEach((i) => {
        let ideaResult = this.dbService.ideas.find((idea) => idea.id === i.id);
        if (ideaResult) {
          ideas[ideaResult.id] = ideaResult;
        }
      });
    });

    let concepts: { [id: number]: Concept } = {};

    result.tags.forEach((tag) => {
      tag.concepts.forEach((c) => {
        let conceptResult = this.dbService.concepts.find(
          (concept) => concept.id === c.id
        );
        if (conceptResult) {
          concepts[conceptResult.id] = conceptResult;
        }
      });
    });

    for (let key in ideas) {
      result.ideas.push(ideas[key]);
    }

    for (let key in concepts) {
      result.concepts.push(concepts[key]);
    }

    return result;
  }

  /*
  public getIdeaFromDbUsingIdeaId(IdeaId: string) {
    return of(this.dbService.ideas.find((x) => x.name.includes(idList)));
  }

  public getIdeasFromDbUsingTagIds(idList: string) {
    return of(this.dbService.ideas.find((x) => x.name.includes(idList)));
  }

  public getTagsFromDb() {
    return this.http.get<Tag[]>(`${this.baseUrl}api/Tags`);
  }

  public createNewTagOnDb(tagName: string) {
    const body = JSON.stringify({ id: 0, name: tagName });

    return this.http.post<Tag>(
      `${this.baseUrl}api/Tags`,
      body,
      this.httpOptions
    );
  }
  */

  public saveIdea(dbIdea: IdeaForIndividualViewModel) {
    let self = this;
    const body = JSON.stringify(dbIdea);
    return self.http.post<IdeaForIndividualViewModel>(
      `${this.baseUrl}api/Ideas`,
      body,
      this.httpOptions
    );
  }

  public updateIdea(dbIdea: IdeaForIndividualViewModel) {
    const body = JSON.stringify(dbIdea);
    return this.http.put<IdeaForIndividualViewModel>(
      `${this.baseUrl}api/Ideas/${dbIdea.id}`,
      body,
      this.httpOptions
    );
  }

  public markAsDone(IdeaId: number) {
    return this.http.put<any>( // hola
      `${this.baseUrl}api/Ideas/${IdeaId}/status/100`,
      { status: 100 },
      this.httpOptions
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error(error);
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    // Return an observable with a user-facing error message.
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
