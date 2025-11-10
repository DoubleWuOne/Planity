import { Component, inject } from '@angular/core';
import { CommonModule, NgSwitch, NgSwitchCase } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours, addWeeks, addMonths, subWeeks, subMonths, setHours, setMinutes, addMinutes } from 'date-fns';
import { Subject } from 'rxjs';
import {
  CalendarEvent,
  CalendarView,
  CalendarMonthViewComponent,
  CalendarWeekViewComponent,
  CalendarDayViewComponent,
  CalendarDatePipe,
  CalendarEventTitleFormatter,
  CalendarEventActionsComponent,
  CalendarEventTimesChangedEvent,
  CalendarEventTimesChangedEventType,
  CalendarEventTitleComponent,
  provideCalendar,
  DateAdapter,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarService } from '../../services/calendar.service';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSwitch,
    NgSwitchCase,
    CalendarMonthViewComponent,
    CalendarWeekViewComponent,
    CalendarDayViewComponent,
    CalendarDatePipe,
    CalendarEventTitleComponent,
    CalendarEventActionsComponent,
  ],
  providers: [
    provideCalendar({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent {
  private calendarService = inject(CalendarService);
  
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  selectedDate: Date | null = null;
  // default view key stored in localStorage (one of CalendarView values)
  defaultViewKey: string = '';

  refresh = new Subject<void>();

  // Event form modal
  showEventModal = false;
  isEditMode = false;
  editingEvent: CalendarEvent | null = null;
  eventForm = {
    title: '',
    description: '',
    date: '',  // Changed to string for date input compatibility
    startTime: '00:00',
    endTime: '00:00',
    allDay: true
  };

  // Events will be loaded from backend; start with empty array
  events: CalendarEvent[] = [];

  activeDayIsOpen: boolean = true;
  dragToCreateActive = false;
  tempEventStart: Date | null = null;
  tempEventEnd: Date | null = null;
  tempEvent: CalendarEvent | null = null;
  currentViewSegments: any = null;

  ngOnInit() {
    // load user's preferred default view (if set)
    const saved = localStorage.getItem('calendarDefaultView');
    if (saved) {
      try {
        this.view = saved as CalendarView;
      } catch {
        this.view = CalendarView.Month;
      }
    }

    this.defaultViewKey = this.view;

    this.loadEvents();
  }

  setDefaultViewFromSelect(): void {
    // save selected default view to localStorage and apply it immediately
    if (this.defaultViewKey) {
      localStorage.setItem('calendarDefaultView', this.defaultViewKey);
      this.view = this.defaultViewKey as CalendarView;
    }
  }

  loadEvents() {
    this.calendarService.getCalendarEvents().subscribe({
      next: (events) => {
        // Transform backend events to CalendarEvent[] expected by angular-calendar
        // Backend event shape is expected to contain at least: id, title, start, end, description, allDay
        try {
          this.events = (events || []).map((ev: any) => {
            // Accept multiple possible backend field names for start/end
            const rawStart = ev.start ?? ev.startDate ?? ev.startTime ?? ev.date ?? ev.from ?? ev.begin;
            const rawEnd = ev.end ?? ev.endDate ?? ev.endTime ?? ev.to ?? ev.finish ?? ev.until;

            const start = rawStart ? new Date(rawStart) : new Date();
            const end = rawEnd ? new Date(rawEnd) : undefined;

            // If backend uses flags for all-day or stores end as end-of-day marker, keep it
            const allDay = ev.allDay === true || ev.allDay === 'true' || ev.isAllDay === true || ev.allDayEvent === true || ev.allDayEvent === 'true';

            const calendarEvent: CalendarEvent = {
              title: ev.title || ev.name || 'Untitled',
              start: start,
              end: end,
              color: (ev.color && typeof ev.color === 'object') ? ev.color : (ev.color ? { primary: ev.color, secondary: ev.color } : colors.blue),
              draggable: ev.draggable !== false,
              resizable: ev.resizable || { beforeStart: true, afterEnd: true },
              meta: {
                id: ev.id ?? ev.eventId ?? ev._id,
                description: ev.description || ev.meta?.description || ev.desc || ev.description || '',
                raw: ev,
              },
              allDay: allDay,
            };

            return calendarEvent;
          });
        } catch (err) {
          console.error('Failed to map calendar events from backend', err);
          this.events = events || [];
        }

        this.refresh.next();
      },
      error: (error) => {
        console.error('Error loading events:', error);
      }
    });
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  previousPeriod(): void {
    if (this.view === CalendarView.Month) {
      this.viewDate = subMonths(this.viewDate, 1);
    } else if (this.view === CalendarView.Week) {
      this.viewDate = subWeeks(this.viewDate, 1);
    } else if (this.view === CalendarView.Day) {
      this.viewDate = subDays(this.viewDate, 1);
    }
  }

  nextPeriod(): void {
    if (this.view === CalendarView.Month) {
      this.viewDate = addMonths(this.viewDate, 1);
    } else if (this.view === CalendarView.Week) {
      this.viewDate = addWeeks(this.viewDate, 1);
    } else if (this.view === CalendarView.Day) {
      this.viewDate = addDays(this.viewDate, 1);
    }
  }

  today(): void {
    this.viewDate = new Date();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (events.length === 0) {
        // If no events, directly open the modal to add an event
        this.openEventModal(date);
        this.activeDayIsOpen = false;
        this.selectedDate = null;
      } else {
        // If there are events, toggle the event list
        if (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) {
          this.activeDayIsOpen = false;
          this.selectedDate = null;
        } else {
          this.activeDayIsOpen = true;
          this.selectedDate = date;  // Set selected date first
        }
        this.viewDate = date;  // Then update viewDate
      }
    }
  }

  openEventModal(date: Date): void {
    // Format date as YYYY-MM-DD for date input (without timezone conversion)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    this.isEditMode = false;
    this.editingEvent = null;
    this.eventForm = {
      title: '',
      description: '',
      date: dateStr,
      startTime: '00:00',
      endTime: '00:00',
      allDay: true
    };
    this.showEventModal = true;
  }

  openEditEventModal(event: CalendarEvent): void {
    this.isEditMode = true;
    this.editingEvent = event;
    
    // Format date
    const year = event.start.getFullYear();
    const month = String(event.start.getMonth() + 1).padStart(2, '0');
    const day = String(event.start.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Check if it's an all-day event
    const isAllDay = !event.end || (event.end.getHours() === 23 && event.end.getMinutes() === 59);
    
    // Get times
    const startHour = String(event.start.getHours()).padStart(2, '0');
    const startMin = String(event.start.getMinutes()).padStart(2, '0');
    const endHour = event.end ? String(event.end.getHours()).padStart(2, '0') : '00';
    const endMin = event.end ? String(event.end.getMinutes()).padStart(2, '0') : '00';
    
    this.eventForm = {
      title: event.title,
      description: event.meta?.description || '',
      date: dateStr,
      startTime: `${startHour}:${startMin}`,
      endTime: `${endHour}:${endMin}`,
      allDay: isAllDay
    };
    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.isEditMode = false;
    this.editingEvent = null;
  }

  saveEvent(): void {
    if (!this.eventForm.title.trim()) {
      alert('Please enter a title');
      return;
    }

    // Parse the date string to Date object
    const eventDate = new Date(this.eventForm.date);
    let startDate: Date;
    let endDate: Date;

    if (this.eventForm.allDay) {
      // create exact local midnight -> 23:59 for all-day events to avoid timezone shifts
      startDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 0, 0, 0, 0);
      endDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 23, 59, 0, 0);
    } else {
      const [startHour, startMin] = this.eventForm.startTime.split(':').map(Number);
      const [endHour, endMin] = this.eventForm.endTime.split(':').map(Number);
      
      startDate = setMinutes(setHours(eventDate, startHour), startMin);
      endDate = setMinutes(setHours(eventDate, endHour), endMin);
    }

    // Helper: format local datetime without timezone designator so backend receives local time
    const formatLocal = (d: Date) => {
      if (!d) return null;
      const y = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      return `${y}-${mo}-${da}T${hh}:${mm}:${ss}`; // no trailing Z
    };

    // Send local datetime strings using backend field names (startTime/endTime/allDayEvent)
    const eventData = {
      title: this.eventForm.title.trim(),
      description: this.eventForm.description,
      startTime: startDate ? formatLocal(startDate) : null,
      endTime: endDate ? formatLocal(endDate) : null,
      allDayEvent: this.eventForm.allDay
    };

    if (this.isEditMode && this.editingEvent) {
      // Update existing event
      // Determine backend id (stored in meta.id when mapping)
      const eventId = (this.editingEvent as any)?.meta?.id ?? (this.editingEvent as any)?.id;
      if (!eventId) {
        console.error('No event id found for editing');
        alert('Cannot update event: missing id');
        return;
      }

      this.calendarService.editCalendarEvent(eventId, eventData).subscribe({
        next: (updatedEvent) => {
          // reload events from backend to keep frontend in sync
          this.loadEvents();
          this.closeEventModal();
        },
        error: (error) => {
          console.error('Error updating event:', error);
          alert('Failed to update event');
        }
      });
    } else {
      // Add new event
      this.calendarService.addCalendarEvent(eventData).subscribe({
        next: (newEvent) => {
          // refresh events from backend so mapping/ids are consistent
          this.loadEvents();
          this.closeEventModal();
        },
        error: (error) => {
          console.error('Error adding event:', error);
          alert('Failed to add event');
        }
      });
    }
  }

  deleteEvent(): void {
    if (this.editingEvent && confirm('Are you sure you want to delete this event?')) {
      const eventId = (this.editingEvent as any)?.meta?.id ?? (this.editingEvent as any)?.id;
      if (!eventId) {
        console.error('No event id found for delete');
        alert('Cannot delete event: missing id');
        return;
      }

      this.calendarService.deleteCalendarEvent(eventId).subscribe({
        next: () => {
          // reload events from backend
          this.loadEvents();
          this.closeEventModal();
        },
        error: (error) => {
          console.error('Error deleting event:', error);
          alert('Failed to delete event');
        }
      });
    }
  }

  addEventOnDate(date: Date): void {
    this.openEventModal(date);
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    // Immediately update the event object so UI and the edit modal show new times
    try {
      (event as any).start = newStart;
      (event as any).end = newEnd;
    } catch (err) {
      // ignore
    }
    this.refresh.next();

    // Persist the new times to backend (if possible) then refresh
    const eventId = (event as any)?.meta?.id ?? (event as any)?.id;
    if (!eventId) {
      // No backend id: nothing more to do
      return;
    }

    const updatePayload = {
      startTime: newStart ? newStart.toISOString() : null,
      endTime: newEnd ? newEnd.toISOString() : null,
    };

    this.calendarService.editCalendarEvent(eventId, updatePayload).subscribe({
      next: () => {
        this.loadEvents();
      },
      error: (err) => {
        console.error('Failed to persist moved/resized event', err);
        // still update locally so UI remains responsive (already applied above)
        this.refresh.next();
      }
    });

    // Open edit modal for the moved/resized event (will show updated times)
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.openEditEventModal(event);
  }

  beforeWeekOrDayViewRender(renderEvent: any): void {
    // Store segment data from the render event for drag-to-create
    if (renderEvent.period) {
      this.currentViewSegments = renderEvent.period;
    }
  }

  startDragToCreate(startDate: Date): void {
    this.dragToCreateActive = true;
    this.tempEventStart = startDate;
    this.tempEventEnd = addMinutes(startDate, 30);
    
    // Create temporary visual event
    this.tempEvent = {
      start: this.tempEventStart,
      end: this.tempEventEnd!,
      title: 'New Event',
      color: { primary: '#6366f1', secondary: '#c7d2fe' },
      draggable: false,
      resizable: { beforeStart: false, afterEnd: false }
    };
    this.events = [...this.events, this.tempEvent!];
    this.refresh.next();
    
    // Add global mouseup listener
    const mouseUpHandler = () => {
      if (this.dragToCreateActive) {
        this.endDragToCreate();
      }
      document.removeEventListener('mouseup', mouseUpHandler);
    };
    document.addEventListener('mouseup', mouseUpHandler);
  }

  updateDragToCreate(currentDate: Date): void {
    if (!this.tempEventStart) return;
    
    // Update end time if dragging forward
    if (currentDate >= this.tempEventStart) {
      this.tempEventEnd = addMinutes(currentDate, 30);
      if (this.tempEvent) {
        this.tempEvent.end = this.tempEventEnd!;
        this.refresh.next();
      }
    }
  }

  hourSegmentClicked(event: { date: Date; sourceEvent: MouseEvent }): void {
    // Simple click handler - only fires if not dragging
    if (!this.dragToCreateActive) {
      this.openModalForTimeSlot(event.date);
    }
  }

  onHourSegmentMouseDown(date: Date, event: MouseEvent): void {
    event.preventDefault();
    this.startDragToCreate(date);
  }

  onHourSegmentMouseMove(date: Date, event: MouseEvent): void {
    if (this.dragToCreateActive) {
      this.updateDragToCreate(date);
    }
  }

  onHourSegmentMouseUp(date: Date, event: MouseEvent): void {
    if (this.dragToCreateActive) {
      this.endDragToCreate();
    }
  }

  endDragToCreate(): void {
    if (!this.tempEventStart || !this.tempEventEnd) return;
    
    // Remove temporary event
    if (this.tempEvent) {
      this.events = this.events.filter(e => e !== this.tempEvent);
      this.tempEvent = null;
    }
    
    // Open modal with selected time range
    this.openModalForTimeSlot(this.tempEventStart, this.tempEventEnd);
    
    // Reset drag state
    this.dragToCreateActive = false;
    this.tempEventStart = null;
    this.tempEventEnd = null;
  }

  openModalForTimeSlot(startDate: Date, endDate?: Date): void {
    // Format date as YYYY-MM-DD
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Get the start hour and minute
    const startHour = String(startDate.getHours()).padStart(2, '0');
    const startMin = String(startDate.getMinutes()).padStart(2, '0');
    
    // Calculate end time
    const finalEndDate = endDate || addHours(startDate, 1);
    const endHour = String(finalEndDate.getHours()).padStart(2, '0');
    const endMin = String(finalEndDate.getMinutes()).padStart(2, '0');
    
    this.isEditMode = false;
    this.editingEvent = null;
    this.eventForm = {
      title: '',
      description: '',
      date: dateStr,
      startTime: `${startHour}:${startMin}`,
      endTime: `${endHour}:${endMin}`,
      allDay: false
    };
    this.showEventModal = true;
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ];
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
