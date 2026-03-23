import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Blockchain } from './blockchain';

describe('Blockchain', () => {
  let component: Blockchain;
  let fixture: ComponentFixture<Blockchain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Blockchain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Blockchain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
