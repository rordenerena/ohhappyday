import { RatingComponent } from './rating.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

describe('RatingComponent', () => {
    let component: RatingComponent;
    let fixture: ComponentFixture<RatingComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RatingComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(RatingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('setting value once', () => {
        component.setRate(0);
        expect(component.value).toBe(0);
    });
    it('setting same value twice', () => {
        component.setRate(0);
        expect(component.value).toBe(0);
        component.setRate(0);
        expect(component.value).toBe(-1);
    });
    it('setting same value 3 times', () => {
        component.setRate(0);
        expect(component.value).toBe(0);
        component.setRate(0);
        expect(component.value).toBe(-1);
        component.setRate(0);
        expect(component.value).toBe(0);
    });
    it('setting differents values different times', () => {
        component.setRate(0);
        expect(component.value).toBe(0);
        component.setRate(0);
        expect(component.value).toBe(-1);
        component.setRate(1);
        expect(component.value).toBe(1);
        component.setRate(1);
        expect(component.value).toBe(-1);
        component.setRate(2);
        expect(component.value).toBe(2);
        component.setRate(2);
        expect(component.value).toBe(-1);
    });
    it('setting overflow value and nothing happend', () => {
        component.setRate(0);
        expect(component.value).toBe(0);
        component.setRate(-5);
        expect(component.value).toBe(0);
        component.setRate(6);
        expect(component.value).toBe(0);
    });


    
});
