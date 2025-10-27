import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

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

  todaysTasks: Task[] = [];
  loadingTasks = false;

  // react to changes in currentUser signal and load today's tasks when user is present
  private _watch = effect(() => {
    const user = this.accountService.currentUser();
    if (user) {
      this.loadTodayTasks();
    } else {
      this.todaysTasks = [];
    }
  });

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
