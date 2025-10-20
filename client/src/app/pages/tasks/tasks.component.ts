import { Component } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { TaskListComponent } from '../../components/task-list/task-list.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, NgIf, TaskListComponent, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent {
  // mock data — will be replaced by backend calls later
  tasks: Task[] = [
    { id: 1, title: 'Buy groceries', description: 'Milk, eggs, bread, and some fruit', date: new Date().toISOString().slice(0,10), completed: true, color: '#f97316', type: 'personal' },
    { id: 2, title: 'Team meeting', description: 'Discuss Q4 roadmap and deliverables', date: new Date().toISOString().slice(0,10), completed: false, color: '#06b6d4', type: 'work' },
    { id: 3, title: 'Write report', description: 'Summarize last week progress for the stakeholders', completed: false, color: '#7c3aed', type: 'work' },
    { id: 4, title: 'Plan workout', description: '30 minutes cardio + stretching', date: new Date().toISOString().slice(0,10), completed: false, color: '#10b981', type: 'health' },
    { id: 5, title: 'Read book', description: 'Finish chapter 4 of the UX book', completed: false, color: '#ef4444', type: 'personal' }
  ];

  onTaskUpdated(t: Task) {
    const idx = this.tasks.findIndex(x => x.id === t.id);
    if (idx !== -1) this.tasks[idx] = t;
  }

  onTaskToggled(t: Task) {
    const idx = this.tasks.findIndex(x => x.id === t.id);
    if (idx !== -1) this.tasks[idx].completed = !!t.completed;
  }

  get todaysTasks() {
    const today = new Date().toISOString().slice(0,10);
    return this.tasks.filter(t => t.date === today && !t.completed);
  }

  /** Tasks that are not completed */
  get openTasks() {
    return this.tasks.filter(t => !t.completed);
  }

  get doneTasks() {
    return this.tasks.filter(t => !!t.completed);
  }

  // Add task UI state
  showAdd = false;
  newTask: Partial<Task> = { title: '', description: '', date: new Date().toISOString().slice(0,10), color: '#e5e7eb', type: '' };
  addTouched = false; // mark that the add form was interacted with for validation UI

  get titleInvalid() {
    return !(this.newTask.title && this.newTask.title.trim().length > 0);
  }

  addTask() {
    this.addTouched = true;
    const title = (this.newTask.title || '').toString().trim();
    if (!title) return;
    const id = Math.max(0, ...this.tasks.map(t => t.id || 0)) + 1;
    const task: Task = {
      id,
      title: this.newTask.title || '',
      description: this.newTask.description || '',
      date: this.newTask.date,
      completed: false,
      color: this.newTask.color,
      type: this.newTask.type
    } as Task;
    this.tasks.push(task);
    this.showAdd = false;
    // reset
    this.newTask = { title: '', description: '', date: new Date().toISOString().slice(0,10), color: '#e5e7eb', type: '' };
    this.addTouched = false;
  }

  cancelAdd() {
    this.showAdd = false;
    this.newTask = { title: '', description: '', date: new Date().toISOString().slice(0,10), color: '#e5e7eb', type: '' };
  }
}
