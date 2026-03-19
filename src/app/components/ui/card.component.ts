import { Component, Input, HostBinding, HostListener, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../lib/utils';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CardComponent {
  @Input() className = '';
  @Output() click = new EventEmitter<MouseEvent>();

  @HostBinding('class')
  get classes() {
    return cn(
      "rounded-2xl border border-gray-100 bg-white text-gray-900 shadow-sm transition-all",
      this.className
    );
  }

  @HostListener('click', ['$event'])
  onCardClick(event: MouseEvent) {
    this.click.emit(event);
  }
}
