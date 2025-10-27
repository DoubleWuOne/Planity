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
  lastRoutinesGrouped: Array<{ date: string; display: string; day: number; items: Array<{ id:number; title:string; time?:string | null; isCompleted: boolean }> }> = [];
  // history controls
  showAllHistory = false;
  readonly HISTORY_DAY_LIMIT = 7;
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
    // try backend first, fallback to local
    this.routineService.getRoutines().subscribe({
      next: (list) => {
        this.routines = this.sortList(list || []);
        this.buildSections();
      },
      error: (err) => {
        console.error('Failed to load routines from backend, using local data', err);
        const list = this.routineService.getAllLocal();
        this.routines = this.sortList(list);
        this.buildSections();
      }
    });
  }

  private buildSections(){
    const today = new Date();
    const todayStr = today.toISOString().slice(0,10);
    this.todayDateDisplay = this.formatDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0,10);
    this.yesterdayDateDisplay = this.formatDate(yesterday);

    // Today's routines: show all routines (sorted)
    this.todayRoutines = this.sortList(this.routines.slice());

    // Yesterday: routines that had a completion entry for yesterday
    this.yesterdayRoutines = this.routines
      .map(r => {
        const c = (r.completions || []).find(x => this.isSameDate(x.date, yesterday));
        return c ? { r, wasCompleted: !!c.isCompleted } : null;
      })
      .filter(Boolean) as Array<{ r: Routine, wasCompleted: boolean }>;

    // Last routines: flatten historical completions excluding today and yesterday
    const entries: Array<{ id:number; title:string; date:string; time?: string | null; isCompleted:boolean }> = [];
    for (const r of this.routines){
      const comps = r.completions || [];
      for (const c of comps){
  if (!c.date) continue;
  // skip entries from today or yesterday using date-object comparison
  if (this.isSameDate(c.date, today) || this.isSameDate(c.date, yesterday)) continue;
        entries.push({ id: r.id, title: r.title, date: c.date, time: r.time ?? null, isCompleted: !!c.isCompleted });
      }
    }
    // group by date and sort desc by date
    const map = new Map<string, Array<{ id:number; title:string; time?:string | null; isCompleted:boolean }>>();
    for (const e of entries){
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push({ id: e.id, title: e.title, time: e.time, isCompleted: e.isCompleted });
    }
    const groups: Array<{ date:string; display:string; day:number; items: Array<{ id:number; title:string; time?:string | null; isCompleted:boolean }> }> = [];
    for (const [date, items] of map){
      const d = new Date(date);
      const display = this.formatDate(d);
      groups.push({ date, display, day: d.getDate(), items });
    }
    groups.sort((a,b) => b.date.localeCompare(a.date));
    this.lastRoutinesGrouped = groups;

  }

  private sortList(list: Routine[]) {
    const withTime = list.filter(r => r.time).sort((a,b) => (a.time||'').localeCompare(b.time||''));
    const without = list.filter(r => !r.time);
    return [...withTime, ...without];
  }

  private isSameDate(dateString: string | undefined | null, compareDate: Date): boolean {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = compareDate;

    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }

  private formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  // expose displayed groups (respecting the showAllHistory toggle)
  get displayedLastGroups(){
    return this.showAllHistory ? this.lastRoutinesGrouped : this.lastRoutinesGrouped.slice(0, this.HISTORY_DAY_LIMIT);
  }

  toggleShowMoreHistory(){
    this.showAllHistory = !this.showAllHistory;
  }

  addRoutine() {
    if (!this.newTitle || this.newTitle.trim().length === 0) return;
    const title = this.newTitle.trim().slice(0, this.TITLE_MAX);
    const payload = { title, time: this.newTime || null };
    this.routineService.addRoutine(payload).subscribe({
      next: () => {
        this.newTitle = '';
        this.newTime = null;
        this.load();
      },
      error: (err) => {
        console.error('Add routine failed, falling back to local add', err);
        this.routineService.addLocal({ title, time: this.newTime || null });
        this.newTitle = '';
        this.newTime = null;
        this.load();
      }
    });
    // scroll strip to right in template using a small timeout (handled in template if needed)
  }

  startEdit(r: Routine) {
    this.editingId = r.id;
    this.editTitle = r.title;
    this.editTime = r.time ?? null;
  }

  saveEdit(r: Routine) {
    const title = (this.editTitle || '').trim().slice(0, this.TITLE_MAX);
    const payload = { title, time: this.editTime || null };
    this.routineService.editRoutine(r.id, payload).subscribe({
      next: () => {
        this.editingId = null;
        this.editTitle = '';
        this.editTime = null;
        this.load();
      },
      error: (err) => {
        console.error('Edit routine failed, falling back to local update', err);
        this.routineService.updateLocal(r.id, payload);
        this.editingId = null;
        this.editTitle = '';
        this.editTime = null;
        this.load();
      }
    });
  }

  cancelEdit() {
    this.editingId = null;
  }

  toggleCompletion(r: Routine) {
    const currently = this.routineService.isCompletedToday(r);
    const desired = !currently;
    this.routineService.editStatusRoutine(r.id, desired).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error('Toggle status failed, falling back to local toggle', err);
        const res = this.routineService.toggleTodayLocal(r.id);
        if (typeof res === 'boolean') this.load();
      }
    });
  }

  deleteRoutine(r: Routine) {
    const confirmDelete = confirm(`Usuń rutynę "${r.title}"?`);
    if (!confirmDelete) return;
    this.routineService.deleteRoutine(r.id).subscribe({
      next: (ok) => { if (ok) this.load(); },
      error: (err) => {
        console.error('Delete routine failed, falling back to local delete', err);
        const ok = this.routineService.deleteLocal(r.id);
        if (ok) this.load();
      }
    });
  }

  isCompletedToday(r: Routine): boolean {
    return this.routineService.isCompletedToday(r);
  }
}
