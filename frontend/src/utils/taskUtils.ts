/**
 * Task utility functions for managing task statuses and deduplication
 */

export type TaskStatus = 'pending' | 'active' | 'completed' | 'overdue' | 'missed';

/**
 * Get the current status of a task
 * @param task - The task object
 * @param now - Current date/time (defaults to now)
 * @returns The task status
 */
export function getTaskStatus(task: any, now: Date = new Date()): TaskStatus {
  if (task.status === 'Completed') {
    return 'completed';
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const taskDate = new Date(task.date || task.dueDate);
  taskDate.setHours(0, 0, 0, 0);

  // If task belongs to a previous day, it's missed
  if (taskDate < today) {
    return 'missed';
  }

  // If task is for today, check if it's overdue
  if (taskDate.getTime() === today.getTime()) {
    if (task.endTime) {
      const [endHour, endMin] = task.endTime.split(':').map(Number);
      const taskEndTime = new Date(now);
      taskEndTime.setHours(endHour, endMin, 0, 0);

      if (now > taskEndTime) {
        return 'overdue';
      }
    }
    return 'active';
  }

  return 'pending';
}

/**
 * Deduplicate recurring task instances
 * Groups tasks by templateId and selects one representative per template
 * Selection priority: today's instance > next upcoming > most recent past
 * @param instances - Array of task instances
 * @returns Deduplicated list with one representative per template
 */
export function dedupeRecurringInstances(instances: any[]): any[] {
  const nonRecurring = instances.filter((t) => !t.templateId);

  const grouped: { [key: string]: any[] } = {};
  instances.forEach((task) => {
    if (task.templateId) {
      if (!grouped[task.templateId]) {
        grouped[task.templateId] = [];
      }
      grouped[task.templateId].push(task);
    }
  });

  const deduped = Object.values(grouped).map((group) => {
    const today = new Date().toISOString().split('T')[0];

    // 1. Try to find today's instance
    const todayInstance = group.find((t) => t.date === today || t.dueDate === today);
    if (todayInstance) return todayInstance;

    // 2. Try to find next upcoming instance
    const sorted = group.sort(
      (a, b) =>
        new Date(a.date || a.dueDate).getTime() - new Date(b.date || b.dueDate).getTime(),
    );
    const upcomingInstance = sorted.find(
      (t) => (t.date || t.dueDate) > today,
    );
    if (upcomingInstance) return upcomingInstance;

    // 3. Return most recent past instance
    return sorted[sorted.length - 1];
  });

  return [...nonRecurring, ...deduped];
}

/**
 * Format a task date for display
 * @param dateStr - Date string (YYYY-MM-DD)
 * @returns Formatted date like "Jun 18, 2026"
 */
export function formatTaskDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00Z');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a time string for display
 * @param timeStr - Time string (HH:MM in 24-hour format)
 * @returns Formatted time like "6:00 AM"
 */
export function formatTime(timeStr: string): string {
  try {
    const [hour, min] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, min, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeStr;
  }
}

/**
 * Format task date and time for display
 * @param task - Task object
 * @returns Formatted string like "Jun 18, 2026 • 06:00 AM – 09:00 AM"
 */
export function formatTaskDateTime(task: any): string {
  const dateStr = formatTaskDate(task.date || task.dueDate);

  if (task.startTime && task.endTime) {
    const startTime = formatTime(task.startTime);
    const endTime = formatTime(task.endTime);
    return `${dateStr} • ${startTime} – ${endTime}`;
  }

  return dateStr;
}

/**
 * Get human-readable status label for overdue tasks
 * @param task - Task object
 * @param now - Current date/time
 * @returns Status label like "2h 30m late"
 */
export function getOverdueLabel(task: any, now: Date = new Date()): string {
  if (!task.endTime) return 'Overdue';

  const [endHour, endMin] = task.endTime.split(':').map(Number);
  const taskEndTime = new Date(now);
  taskEndTime.setHours(endHour, endMin, 0, 0);

  const diffMs = now.getTime() - taskEndTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins}m late`;
  }

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (mins === 0) {
    return `${hours}h late`;
  }

  return `${hours}h ${mins}m late`;
}
