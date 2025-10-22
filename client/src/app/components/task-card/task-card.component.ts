import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  template: `
    <div class="task-card" [style.border-top-color]="task.color || '#e5e7eb'">
      <div class="accent"> 
        <div class="left">
          <div class="type-bullet" [style.background]="task.color || '#c7c7c7'"></div>
          <div class="type-label">{{ task.type || '' }}</div>
        </div>
        <div class="date-label">{{ formattedDate }}</div>
      </div>

      <div class="task-top">
        <input type="checkbox" [checked]="task.isCompleted" (change)="onCheckboxChange($event)" />
        <span class="task-title" [class.done]="task.isCompleted" (click)="startEdit($event)">{{ task.title }}</span>
      </div>

      <div *ngIf="editing" class="edit-area">
        <input [(ngModel)]="buffer.title" />
        <textarea [(ngModel)]="buffer.description"></textarea>
        <label>Type</label>
        <select [(ngModel)]="buffer.type">
          <option value="">(select)</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>
        <label class="color-row">Card color: <input type="color" [(ngModel)]="bufferColor" /></label>
        <div class="edit-actions">
          <button class="btn" (click)="save()">Save</button>
          <button class="btn" (click)="cancel()">Cancel</button>
          <button class="btn" (click)="remove.emit(task)">Delete</button>
        </div>
      </div>

      <div *ngIf="!editing" class="task-desc" (click)="startEdit($event)">{{ task.description }}</div>
    </div>
  `,
  styles: [
    `
  :host { display:block; }
  /* subtle paper texture via SVG data-uri */
  .task-card { background: linear-gradient(180deg,#fff,#fbfdff), url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><filter id='f'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23f)' opacity='0.03'/></svg>"); background-blend-mode: overlay; border-radius:10px; padding:1rem; box-shadow: 0 8px 20px rgba(2,6,23,0.06); min-width:220px; max-width:340px; transition: transform 160ms ease, box-shadow 160ms ease; border-top:6px solid transparent; }
    .task-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(2,6,23,0.18); }
  .accent { display:flex; align-items:center; justify-content:space-between; gap:0.6rem; margin-bottom:0.6rem; }
  .accent .left { display:flex; align-items:center; gap:0.6rem; }
  .type-bullet { width:12px; height:12px; border-radius:50%; box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset; }
  .type-label { font-size:0.8rem; color:#475569; text-transform:capitalize; }
  .date-label { font-size:0.8rem; color:#6b7280; }
    .task-top { display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem; }
    .task-top input[type="checkbox"] { width:18px; height:18px; }
    .task-title { font-weight:700; cursor:pointer; }
    .task-title.done { text-decoration:line-through; color:#9aa4ac; }
    .task-desc { color:#475569; font-size:0.95rem; }
    .edit-area { display:flex; flex-direction:column; gap:0.5rem; }
    .edit-area input, .edit-area textarea { padding:0.5rem; border-radius:8px; border:1px solid rgba(2,6,23,0.06); }
    .color-row { display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:#374151; }
    .edit-actions { display:flex; gap:0.5rem; }
    .btn { background:transparent; border:1px solid rgba(2,6,23,0.06); padding:0.4rem 0.6rem; border-radius:8px; cursor:pointer; }
    @media(max-width:700px){ .task-card { max-width:100%; } }
    `
  ]
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() updated = new EventEmitter<Task>();
  @Output() toggle = new EventEmitter<Task>();
  @Output() remove = new EventEmitter<Task>();

  editing = false;
  buffer: { title: string; description: string; type?: string } = { title: '', description: '', type: '' };
  bufferColor: string = '#e5e7eb';

  edit() {
    this.editing = true;
    this.buffer = { title: this.task.title, description: this.task.description, type: this.task.type };
    this.bufferColor = this.task.color || '#e5e7eb';
  }

  startEdit(e?: Event) {
    // prevent clicks on title/description from toggling the checkbox when input is wrapped by a label
    e?.stopPropagation();
    this.edit();
  }

  get formattedDate() {
    if (!this.task?.dueDate) return '';
    try {
      const d = new Date(this.task.dueDate);
      return d.toLocaleDateString();
    } catch (e) {
      return this.task.dueDate;
    }
  }

  save() {
    this.task.title = this.buffer.title;
    this.task.description = this.buffer.description;
    this.task.type = this.buffer.type || this.task.type;
    this.task.color = this.bufferColor;
    this.editing = false;
    this.updated.emit(this.task);
  }

  onCheckboxChange(e: Event) {
    const checked = !!(e.target as HTMLInputElement).checked;
    this.task.isCompleted = checked;
    // emit so parent can react (move between sections)
    this.toggle.emit(this.task);
  }

  cancel() { this.editing = false; }
}
