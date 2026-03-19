import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../lib/utils';

@Component({
  selector: 'button[appButton]',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    :host:disabled {
      cursor: not-allowed;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' | 'icon' = 'md';
  @Input() className = '';

  @HostBinding('class')
  get classes() {
    return cn(
      "rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
      {
        "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md active:scale-95 transition-all": this.variant === "primary",
        "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all hover:shadow-sm": this.variant === "secondary",
        "bg-danger text-white hover:bg-danger/90 active:scale-95 transition-all": this.variant === "danger",
        "hover:bg-gray-100 text-gray-700 active:scale-95 transition-all": this.variant === "ghost",
        "h-8 px-3 text-xs": this.size === "sm",
        "h-10 px-4 py-2 text-sm": this.size === "md",
        "h-12 px-8 text-base": this.size === "lg",
        "h-10 w-10 p-0 rounded-full": this.size === "icon",
      },
      this.className
    );
  }
}
