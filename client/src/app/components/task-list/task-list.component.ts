import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent],
  template: `
    <div class="cards">
      <app-task-card *ngFor="let t of tasks" [task]="t" (updated)="onUpdated($event)" (toggle)="onToggle($event)" (remove)="onRemove($event)"></app-task-card>
    </div>
  `,
  styles: [
    `
    :host { display:block; }
    .cards { display:flex; gap:0.75rem; flex-wrap:wrap; }
    `
  ]
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() updated = new EventEmitter<Task>();
  @Output() toggled = new EventEmitter<Task>();
  @Output() removed = new EventEmitter<Task>();

  onUpdated(t: Task) { this.updated.emit(t); }
  onToggle(t: Task) { this.toggled.emit(t); }
  onRemove(t: Task) { this.removed.emit(t); }
}
