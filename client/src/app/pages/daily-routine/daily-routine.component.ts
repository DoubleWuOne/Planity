import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routine } from '../../models/routine.model';
import { RoutineService } from '../../services/routine.service';

@Component({
  selector: 'app-daily-routine',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  templateUrl: './daily-routine.component.html',
  styleUrls: ['./daily-routine.component.scss']
})
export class DailyRoutineComponent implements OnInit {
  private routineService = inject(RoutineService);

  routines: Routine[] = [];
  todayRoutines: Routine[] = [];
  yesterdayRoutines: Array<{ r: Routine, wasCompleted: boolean | null }> = [];
  lastRoutines: Array<{ id: number; title: string; date: string; isCompleted: boolean }> = [];
  todayDateDisplay = '';
  yesterdayDateDisplay = '';

  // add form model
  newTitle = '';
  newTime: string | null = null;

  // UI constraints
  readonly TITLE_MAX = 50;

  // editing state: map of id->editing
  editingId: number | null = null;
  editTitle = '';
  editTime: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load() {
    const list = this.routineService.getAllLocal();
    this.routines = this.sortList(list);
    this.buildSections();
  }

  private buildSections(){
    const today = new Date();
    const todayStr = today.toISOString().slice(0,10);
    this.todayDateDisplay = today.toLocaleDateString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0,10);
    this.yesterdayDateDisplay = yesterday.toLocaleDateString();

    // Today's routines: show all routines (sorted)
    this.todayRoutines = this.sortList(this.routines.slice());

    // Yesterday: routines that had a completion entry for yesterday
    this.yesterdayRoutines = this.routines
      .map(r => {
        const c = (r.completions || []).find(x => x.Date === yesterdayStr);
        return c ? { r, wasCompleted: !!c.isCompleted } : null;
      })
      .filter(Boolean) as Array<{ r: Routine, wasCompleted: boolean }>;

    // Last routines: flatten historical completions excluding today and yesterday
    const entries: Array<{ id:number; title:string; date:string; isCompleted:boolean }> = [];
    for (const r of this.routines){
      const comps = r.completions || [];
      for (const c of comps){
        if (!c.Date) continue;
        if (c.Date === todayStr || c.Date === yesterdayStr) continue;
        entries.push({ id: r.id, title: r.title, date: c.Date, isCompleted: !!c.isCompleted });
      }
    }
    // sort desc by date
    this.lastRoutines = entries.sort((a,b) => b.date.localeCompare(a.date));
  }

  private sortList(list: Routine[]) {
    const withTime = list.filter(r => r.time).sort((a,b) => (a.time||'').localeCompare(b.time||''));
    const without = list.filter(r => !r.time);
    return [...withTime, ...without];
  }

  addRoutine() {
    if (!this.newTitle || this.newTitle.trim().length === 0) return;
    const title = this.newTitle.trim().slice(0, this.TITLE_MAX);
    this.routineService.addLocal({ title, time: this.newTime || null });
    this.newTitle = '';
    this.newTime = null;
    this.load();
    // scroll strip to right in template using a small timeout (handled in template if needed)
  }

  startEdit(r: Routine) {
    this.editingId = r.id;
    this.editTitle = r.title;
    this.editTime = r.time ?? null;
  }

  saveEdit(r: Routine) {
    const title = (this.editTitle || '').trim().slice(0, this.TITLE_MAX);
    this.routineService.updateLocal(r.id, { title, time: this.editTime || null });
    this.editingId = null;
    this.editTitle = '';
    this.editTime = null;
    this.load();
  }

  cancelEdit() {
    this.editingId = null;
  }

  toggleCompletion(r: Routine) {
    const res = this.routineService.toggleTodayLocal(r.id);
    if (typeof res === 'boolean') {
      this.load();
    }
  }

  deleteRoutine(r: Routine) {
    const confirmDelete = confirm(`Usuń rutynę "${r.title}"?`);
    if (!confirmDelete) return;
    const ok = this.routineService.deleteLocal(r.id);
    if (ok) this.load();
  }

  isCompletedToday(r: Routine): boolean {
    return this.routineService.isCompletedToday(r);
  }
}
