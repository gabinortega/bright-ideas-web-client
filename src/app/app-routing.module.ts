import { AddEditIdeaComponent } from './components/add-edit-idea/add-edit-idea.component';
import { AddEditConceptComponent } from './components/add-edit-concept/add-edit-concept.component';
import { SearchIdeasComponent } from './components/search-ideas/search-ideas.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: SearchIdeasComponent, pathMatch: 'full' },
  { path: 'search', component: SearchIdeasComponent },
  {
    path: 'edit',
    component: AddEditIdeaComponent,
    children: [{ path: ':id', component: AddEditIdeaComponent }],
  },
  {
    path: 'editConcept',
    component: AddEditConceptComponent,
    children: [{ path: ':id', component: AddEditConceptComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
