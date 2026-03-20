import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';

import { cn } from '../../lib/utils';

@Component({
  selector: 'input[appInput], textarea[appInput]',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class InputComponent {
  @Input() className = '';

  @HostBinding('class')
  get classes() {
    return cn(
      "flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
      this.className
    );
  }
}
