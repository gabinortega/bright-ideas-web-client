import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditConceptComponent } from './add-edit-concept.component';

describe('AddEditConceptComponent', () => {
  let component: AddEditConceptComponent;
  let fixture: ComponentFixture<AddEditConceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddEditConceptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEditConceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //expect(component).toBeTruthy();
  });
});
