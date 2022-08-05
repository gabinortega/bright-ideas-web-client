import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app-root/app.component';
import { SearchIdeasComponent } from './components/search-ideas/search-ideas.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { AddEditIdeaComponent } from './components/add-edit-idea/add-edit-idea.component';
import { AddEditConceptComponent } from './components/add-edit-concept/add-edit-concept.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SearchIdeasComponent,
    NavMenuComponent,
    AddEditIdeaComponent,
    AddEditConceptComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, NgSelectModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
