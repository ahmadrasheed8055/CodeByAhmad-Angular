/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EmailVarificationComponent } from './emailVarification.component';

describe('EmailVarificationComponent', () => {
  let component: EmailVarificationComponent;
  let fixture: ComponentFixture<EmailVarificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailVarificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailVarificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
