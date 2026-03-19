import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider, Zap, Share2, Snowflake, Store, ShieldCheck, X, Download, Loader2, Check, Clock, AlertCircle, Trash2, RefreshCcw, PencilLine, DollarSign, Calendar, Repeat, CheckSquare, Plus, MessageSquare, ExternalLink, CreditCard, History, Paperclip, Flame, Activity, TrendingDown, Trophy, Lock, CheckCircle2, Target, LayoutList, Tag, Settings, Bell, Moon, ChevronRight, Info } from 'lucide-angular';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ 
        Zap, Share2, Snowflake, Store, ShieldCheck, X, Download, Loader2, 
        Check, Clock, AlertCircle, Trash2, RefreshCcw, PencilLine, 
        DollarSign, Calendar, Repeat, CheckSquare, Plus, MessageSquare, 
        ExternalLink, CreditCard, History, Paperclip, Flame, Activity, TrendingDown,
        Trophy, Lock, CheckCircle2, Target, LayoutList, Tag, Settings,
        Bell, Moon, ChevronRight, Info
      })
    }
  ]
};
