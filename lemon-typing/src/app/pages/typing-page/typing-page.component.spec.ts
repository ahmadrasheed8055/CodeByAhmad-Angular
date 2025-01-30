import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypingPageComponent } from './typing-page.component';

describe('TypingPageComponent', () => {
  let component: TypingPageComponent;
  let fixture: ComponentFixture<TypingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
