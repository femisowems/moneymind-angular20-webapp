import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../lib/utils';

@Component({
  selector: 'button[appButton], a[appButton]',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host:active {
      transform: scale(0.96);
    }
    :host::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 5px;
      background: var(--ripple-color, rgba(255, 255, 255, 0.4));
      opacity: 0;
      border-radius: 100%;
      transform: scale(1, 1) translate(-50%, -50%);
      transform-origin: 50% 50%;
    }
    :host.variant-secondary::after, :host.variant-ghost::after {
      --ripple-color: rgba(0, 0, 0, 0.1);
    }
    :host:active::after {
      animation: ripple 0.4s ease-out;
    }
    @keyframes ripple {
      0% {
        transform: scale(0, 0);
        opacity: 0.5;
      }
      100% {
        transform: scale(40, 40);
        opacity: 0;
      }
    }
    :host:disabled {
      cursor: not-allowed;
      transform: none !important;
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
      "rounded-xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
      {
        "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30": this.variant === "primary",
        "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 hover:shadow-md": this.variant === "secondary",
        "bg-danger text-white hover:bg-danger/90 shadow-lg shadow-danger/20": this.variant === "danger",
        "hover:bg-gray-100 text-gray-700": this.variant === "ghost",
        "h-8 px-3 text-xs": this.size === "sm",
        "h-10 px-4 py-2 text-sm": this.size === "md",
        "h-12 px-8 text-base": this.size === "lg",
        "h-10 w-10 p-0 rounded-full": this.size === "icon",
      },
      `variant-${this.variant}`,
      this.className
    );
  }
}
