import { Component, inject, OnInit } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, NgIf, TaskListComponent, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  private taskService = inject(TaskService);

  tasks: Task[] = [];

  ngOnInit(): void {
    this.taskService.getTasks().subscribe({
    next: response => {
      console.log('Loaded tasks:', response);
      this.tasks = response;
    }
    })
  }

  onTaskUpdated(t: Task) {
    const idx = this.tasks.findIndex(x => x.id === t.id);
    if (idx === -1) return;
    // send edit to backend
    const payload = { title: t.title, description: t.description, dueDate: t.dueDate, color: t.color, type: t.type };
    this.taskService.editTask(t.id!, payload).subscribe({
      next: (updated: Task) => {
        this.tasks[idx] = updated;
      },
      error: err => {
        console.error('Failed to update task', err);
        // fallback: apply locally
        this.tasks[idx] = t;
      }
    });
  }

  onTaskToggled(t: Task) {
    const idx = this.tasks.findIndex(x => x.id === t.id);
    if (idx === -1) return;
    const newStatus = !!t.isCompleted;
    // optimistic update
    this.tasks[idx].isCompleted = newStatus;
    this.taskService.editStatusTask(t.id!, newStatus).subscribe({
      next: ok => {
        // server returns boolean success; keep local state
      },
      error: err => {
        console.error('Failed to change task status', err);
        // revert
        this.tasks[idx].isCompleted = !newStatus;
      }
    });
  }

  get todaysTasks() {
    if (!Array.isArray(this.tasks)) return [];
    return this.tasks.filter(task => task.dueDate && this.isToday(task.dueDate) && !task.isCompleted);
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
  /** Tasks that are not completed */
  get openTasks() {
    return this.tasks.filter(t => !t.isCompleted && !this.isToday(t.dueDate || ''));
  }

  get doneTasks() {
     if (!Array.isArray(this.tasks)) return [];
    return this.tasks.filter(t => t.isCompleted);
  }

  // Add task UI state
  showAdd = false;
  newTask: Partial<Task> = { title: '', description: '', dueDate: new Date().toISOString().slice(0, 10), color: '#e5e7eb', type: '' };
  addTouched = false; // mark that the add form was interacted with for validation UI

  get titleInvalid() {
    return !(this.newTask.title && this.newTask.title.trim().length > 0);
  }

  addTask() {
    this.addTouched = true;
    const title = (this.newTask.title || '').toString().trim();
    if (!title) return;
    const id = Math.max(0, ...this.tasks.map(t => t.id || 0)) + 1;
    const taskPayload = {
      title: this.newTask.title || '',
      description: this.newTask.description || '',
      dueDate: this.newTask.dueDate,
      IsCompleted: false,
      color: this.newTask.color,
      type: this.newTask.type
    } as Partial<Task>;

    // Send to backend and on success add to local list using server response (which may include id)
    this.taskService.addTask(taskPayload).subscribe({
      next: (created: any) => {
        // server should return created task; fallback to optimistic merge
        const serverTask = (created && created.id) ? created as Task : ({ id, ...taskPayload } as Task);
        this.tasks.push(serverTask);
        this.showAdd = false;

        // reset
        this.newTask = { title: '', description: '', dueDate: new Date().toISOString().slice(0, 10), color: '#e5e7eb', type: '' };
        this.addTouched = false;
      },
      error: err => {
        console.error('Failed to add task', err);
        // could show UI error; keep optimistic push out for now (or inform user)
      }
    });

  }

  cancelAdd() {
    this.showAdd = false;
    this.newTask = { title: '', description: '', dueDate: new Date().toISOString().slice(0, 10), color: '#e5e7eb', type: '' };
  }
}
