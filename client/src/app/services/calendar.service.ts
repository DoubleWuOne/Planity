import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
   baseUrl = 'http://localhost:5202/api/';
    private http = inject(HttpClient);

    getCalendarEvents(): Observable<any> {
      return this.http.get(this.baseUrl + 'calendar');
    }
    
    addCalendarEvent(values: any): Observable<any> {
      return this.http.post(this.baseUrl + 'calendar', values);
    }

    editCalendarEvent(id: number, values: any): Observable<any> {
      return this.http.put(this.baseUrl + 'calendar/' + id, values);
    }

    deleteCalendarEvent(id: number): Observable<any> {
      return this.http.delete(this.baseUrl + 'calendar/' + id);
    }

}
