import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
    baseUrl = 'http://localhost:5202/api/';
    private http = inject(HttpClient);

    getTasks(){
      return this.http.get<Task[]>(this.baseUrl + 'task/tasks');
    }
    addTask(values: any){
      return this.http.post<Task>(this.baseUrl + 'task/CreateTask', values);
    }

    editTask(id: number, values: any) {
      return this.http.put<Task>(`${this.baseUrl}task/EditTask/${id}`, values);
    }

    editStatusTask(id: number, status: boolean) {
      // API expects a StatusDto object (IsCompleted). Send PascalCase to match DTO and include credentials.
      const body = { IsCompleted: status };
      return this.http.put<boolean>(`${this.baseUrl}task/StatusTask/${id}`, body);
    }

    removeTask(id: number) {
      return this.http.delete<boolean>(`${this.baseUrl}task/RemoveTask/${id}`);
    }

}

