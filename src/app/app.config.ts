import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { LUCIDE_ICONS, LucideIconProvider, Zap, Share2, Snowflake, Store, ShieldCheck, X, Download, Loader2, Check, Clock, AlertCircle, Trash2, RefreshCcw, PencilLine, DollarSign, Calendar, Repeat, CheckSquare, Plus, MessageSquare, ExternalLink, CreditCard, History, Paperclip, Flame, Activity, TrendingDown, Trophy, Lock, CheckCircle2, Target, LayoutList, Tag, Settings, Bell, Moon, ChevronRight, Info } from 'lucide-angular';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
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
    }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
