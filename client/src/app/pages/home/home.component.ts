import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { RoutineService } from '../../services/routine.service';
import { Routine } from '../../models/routine.model';
import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  constructor() {}
  accountService = inject(AccountService);
  private taskService = inject(TaskService);
  routineService = inject(RoutineService);
  private calendarService = inject(CalendarService);

  todaysTasks: Task[] = [];
  loadingTasks = false;
  // routines preview
  todaysRoutines: Routine[] = [];
  loadingRoutines = false;
  // calendar events preview
  todaysCalendarEvents: any[] = [];
  loadingCalendarEvents = false;

  // react to changes in currentUser signal and load today's tasks when user is present
  private _watch = effect(() => {
    const user = this.accountService.currentUser();
    if (user) {
      this.loadTodayTasks();
      this.loadTodayRoutines();
      this.loadTodayCalendarEvents();
    } else {
      this.todaysTasks = [];
      this.todaysRoutines = [];
    }
  });

  private loadTodayRoutines() {
    this.loadingRoutines = true;
    this.routineService.getRoutines().subscribe({
      next: (list) => {
        const today = new Date();
        const normalized = (list || []).map(r => this.normalizeDeletedField(r));
        // filter non-deleted and take up to 3 routines for quick preview
        const visible = normalized.filter(r => !r.deleted);
        // sort by time (those with time first, ordered by time) then those without time last
        visible.sort((a, b) => {
          const aHas = !!(a.time && a.time.trim());
          const bHas = !!(b.time && b.time.trim());
          if (aHas && bHas) return (a.time || '').localeCompare(b.time || '');
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          return 0;
        });
  this.todaysRoutines = visible;
        this.loadingRoutines = false;
      },
      error: (err) => {
        console.error('Failed to load routines for home preview, falling back to local', err);
        const list = this.routineService.getAllLocal().map(r => this.normalizeDeletedField(r));
        const visible = list.filter(r => !r.deleted);
        visible.sort((a, b) => {
          const aHas = !!(a.time && a.time.trim());
          const bHas = !!(b.time && b.time.trim());
          if (aHas && bHas) return (a.time || '').localeCompare(b.time || '');
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;
          return 0;
        });
  this.todaysRoutines = visible;
        this.loadingRoutines = false;
      }
    });
  }

  private loadTodayCalendarEvents() {
    this.loadingCalendarEvents = true;
    this.calendarService.getCalendarEvents().subscribe({
      next: (list) => {
        try {
          const today = new Date();
          const isSameDay = (d: Date) => d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();

          const mapped = (list || []).map((ev: any) => {
            const rawStart = ev.startTime ?? ev.start ?? ev.startDate ?? ev.date ?? ev.from ?? ev.begin;
            const rawEnd = ev.endTime ?? ev.end ?? ev.endDate ?? ev.to ?? ev.finish ?? ev.until;
            const start = rawStart ? new Date(rawStart) : null;
            const end = rawEnd ? new Date(rawEnd) : null;
            const allDay = ev.allDayEvent === true || ev.allDay === true || ev.isAllDay === true;
            return { id: ev.id ?? ev.eventId ?? ev._id, title: ev.title || ev.name || 'Untitled', start, end, allDay, raw: ev };
          });

          const todayEvents = mapped.filter((e: any) => {
            if (e.start) return isSameDay(e.start);
            // if no start but allDay and maybe raw contains date-only field
            const fallbackDate = e.raw?.date ?? e.raw?.day ?? e.raw?.startDate;
            if (fallbackDate) {
              const d = new Date(fallbackDate);
              return isSameDay(d);
            }
            return false;
          }).slice(0, 15);

          this.todaysCalendarEvents = todayEvents;
        } catch (err) {
          console.error('Failed to load calendar preview', err);
          this.todaysCalendarEvents = [];
        }

        this.loadingCalendarEvents = false;
      },
      error: (err) => {
        console.error('Failed to load calendar events for home preview', err);
        this.loadingCalendarEvents = false;
      }
    });
  }

  // support different backend forms for deleted flag
  private normalizeDeletedField(r: any): Routine {
    if (!r) return r;
    const raw = (r.deleted !== undefined) ? r.deleted
      : (r.Deleted !== undefined) ? r.Deleted
      : (r.isDeleted !== undefined) ? r.isDeleted
      : (r.IsDeleted !== undefined) ? r.IsDeleted
      : undefined;
    let deleted = false;
    if (typeof raw === 'boolean') deleted = raw;
    else if (typeof raw === 'string') deleted = raw.toLowerCase() === 'true' || raw === '1';
    else if (typeof raw === 'number') deleted = raw === 1;
    else deleted = false;
    return { ...r, deleted } as Routine;
  }

  private loadTodayTasks() {
    this.loadingTasks = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
  const today = new Date();

  // filter today's incomplete tasks, then take the last 3 (newest added)
  const matched = tasks.filter(task => task.dueDate && this.isToday(task.dueDate) && !task.isCompleted);
  const lastThree = matched.slice(Math.max(matched.length - 3, 0)).reverse(); // newest-first
  this.todaysTasks = lastThree;
        this.loadingTasks = false;
      },
      error: () => { this.loadingTasks = false; }
    });
  }

  private isToday(dateString: string): boolean {
    const d = new Date(dateString);
    const today = new Date();

    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }
  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const els = Array.from(document.querySelectorAll('.testimonial')) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('in-view');
        }
      });
    }, { threshold: 0.25 });

    // Only add the pre-animate state if observer is available.
    els.forEach(el => {
      el.classList.add('pre-animate');
      obs.observe(el);
    });
  }
}
