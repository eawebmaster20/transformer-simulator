import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatSliderModule} from '@angular/material/slider';

@Component({
  selector: 'app-dialpad',
  imports: [MatSliderModule, FormsModule],
  standalone: true,
  templateUrl: './dialpad.component.html',
  styleUrl: './dialpad.component.scss'
})
export class DialpadComponent {
  @Input() minValue: number = 0;
  @Input() label: string = '';
  @Input() maxValue: number = 10;
  @Input() step: number = 0.005;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<number>();
  value: number = 0;

  updateState() {
    // console.log('updateState');
    // this.valueChange.emit(Math.ceil(this.value * 10));
    this.valueChange.emit(this.value);
  }
}
