import { Concept } from './../../shared/concept';
import { Tag } from '../../shared/tag';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { Idea } from 'src/app/shared/idea';

@Component({
  selector: 'app-search-ideas',
  templateUrl: './search-ideas.component.html',
  styleUrls: ['./search-ideas.component.scss'],
})
export class SearchIdeasComponent implements OnInit {
  dbVersion = '';

  listOfIdeas: Idea[] = [];
  listOfTags: Observable<Tag[]> | undefined;
  listOfConcept: Concept[] = [];

  filterTerm = new FormControl();
  listOfTagsToSearch: Tag[] = [];

  constructor() {}

  ngOnInit(): void {}

  onSearch($event: any): void {
    var $tagList = $event.map((t: Tag) => t.name);

    /*
    this.api
      .getSnippetsFromDbUsingTagIds($idList || '')
      .subscribe((dbList: ISnippetForCollectionsViewModel[]): void => {

        if (!$tagList) {
          this.dbList = dbList;
          return;
        }

        if (!dbList.length) {
          dbList.push(this.getNoResultsSnippet($tagList));
        }
        this.dbList = dbList;
      });
      */
  }
}
