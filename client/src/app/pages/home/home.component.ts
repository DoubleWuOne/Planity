import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { RoutineService } from '../../services/routine.service';
import { Routine } from '../../models/routine.model';

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

  todaysTasks: Task[] = [];
  loadingTasks = false;
  // routines preview
  todaysRoutines: Routine[] = [];
  loadingRoutines = false;

  // react to changes in currentUser signal and load today's tasks when user is present
  private _watch = effect(() => {
    const user = this.accountService.currentUser();
    if (user) {
      this.loadTodayTasks();
      this.loadTodayRoutines();
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
