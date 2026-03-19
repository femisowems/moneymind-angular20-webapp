import { Component, Input, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../lib/utils';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`
})
export class BadgeComponent {
  @Input() variant: "info" | "success" | "warning" | "danger" | "neutral" | "primary" = "neutral";
  @Input() className = '';

  @HostBinding('class')
  get classes() {
    return cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
      {
        "bg-gray-100 text-gray-800": this.variant === "neutral",
        "bg-blue-100 text-blue-800": this.variant === "info",
        "bg-success/10 text-success": this.variant === "success",
        "bg-warning/10 text-warning": this.variant === "warning",
        "bg-danger/10 text-danger": this.variant === "danger",
        "bg-primary/10 text-primary": this.variant === "primary",
      },
      this.className
    );
  }
}
