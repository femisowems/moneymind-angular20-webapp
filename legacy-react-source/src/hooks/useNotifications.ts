import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export function useNotifications() {
  const { reminders } = useStore();
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  useEffect(() => {
    if (permission !== 'granted') return;

    // Check for today's reminders that are not completed
    const hasNotified = sessionStorage.getItem('moneyMind_notified_today');
    
    if (!hasNotified) {
      const todayStr = new Date().toISOString().substring(0, 10);
      const dueTodayOrOverdue = reminders.filter(r => {
        if (r.isCompleted) return false;
        const dueStr = r.dueDate.substring(0, 10);
        return dueStr <= todayStr;
      });
      
      if (dueTodayOrOverdue.length > 0) {
        new Notification('MoneyMind Reminder 💸', {
          body: `You have ${dueTodayOrOverdue.length} pending task(s) needing your attention!`,
          icon: '/favicon.ico'
        });
        sessionStorage.setItem('moneyMind_notified_today', 'true');
      }
    }
  }, [reminders, permission]);

  return { permission, requestPermission };
}
