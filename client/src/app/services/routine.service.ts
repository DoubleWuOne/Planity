import { Injectable, inject } from '@angular/core';
import { Routine } from '../models/routine.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private storageKey = 'planity.routines';
  baseUrl = 'http://localhost:5202/api/';
  private http = inject(HttpClient);

  // LocalStorage helpers
  getAllLocal(): Routine[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Routine[];
      return parsed;
    } catch {
      return [];
    }
  }

  saveAllLocal(items: Routine[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  addLocal(r: Partial<Routine>) : Routine {
    const list = this.getAllLocal();
    const id = Math.max(0, ...list.map(x => x.id || 0)) + 1;
    const item: Routine = { id, title: r.title || 'New routine', time: r.time ?? null, completions: r.completions ?? [] };
    list.push(item);
    this.saveAllLocal(list);
    return item;
  }

  updateLocal(id: number, patch: Partial<Routine>) : Routine | undefined {
    const list = this.getAllLocal();
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...patch };
    this.saveAllLocal(list);
    return list[idx];
  }

  toggleTodayLocal(id: number) : boolean | undefined {
    const list = this.getAllLocal();
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return undefined;
    const today = new Date().toISOString().slice(0,10);
    const completions = list[idx].completions ?? [];
    const existing = completions.find(c => c.date === today);
    if (existing) {
      existing.isCompleted = !existing.isCompleted;
    } else {
      completions.push({ id: (completions.length? Math.max(...completions.map(c=>c.id))+1 : 1), isCompleted: true, date: today });
    }
    list[idx].completions = completions;
    this.saveAllLocal(list);
    return completions.find(c=>c.date===today)?.isCompleted;
  }

  deleteLocal(id: number): boolean {
    const list = this.getAllLocal();
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    this.saveAllLocal(list);
    return true;
  }

  isCompletedToday(r: Routine): boolean {
    return !!(r.completions && r.completions.find(c => this.isToday(c.date) && c.isCompleted));
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
  // HTTP wrappers (if backend exists)
  getRoutines(){
    return this.http.get<Routine[]>(this.baseUrl + 'routine/routines');
  }

  addRoutine(values: any){
    return this.http.post<Routine>(this.baseUrl + 'routine/CreateRoutine', values);
  }

  editRoutine(id: number, values: any) {
    return this.http.put<Routine>(`${this.baseUrl}routine/EditRoutine/${id}`, values);
  }

  editStatusRoutine(id: number, status: boolean) {
    const body = { IsCompleted: status };
    return this.http.put<boolean>(`${this.baseUrl}routine/completion/${id}`, body);
  }

  deleteRoutine(id: number) {
    return this.http.delete<boolean>(`${this.baseUrl}routine/deleteRoutine/${id}`);
  }
}
