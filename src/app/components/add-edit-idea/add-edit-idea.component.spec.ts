import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditIdeaComponent } from './add-edit-idea.component';

describe('AddEditIdeaComponent', () => {
  let component: AddEditIdeaComponent;
  let fixture: ComponentFixture<AddEditIdeaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditIdeaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditIdeaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //expect(component).toBeTruthy();
  });
});
