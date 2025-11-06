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

  events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      color: colors.red,
      allDay: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      color: colors.blue,
      allDay: true,
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: addHours(new Date(), 2),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
  ];

  activeDayIsOpen: boolean = true;
  dragToCreateActive = false;
  tempEventStart: Date | null = null;
  tempEventEnd: Date | null = null;
  tempEvent: CalendarEvent | null = null;
  currentViewSegments: any = null;

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.calendarService.getCalendarEvents().subscribe({
      next: (events) => {
        // Transform backend events to CalendarEvent format if needed
        this.events = events;
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
      startDate = startOfDay(eventDate);
      endDate = endOfDay(eventDate);
    } else {
      const [startHour, startMin] = this.eventForm.startTime.split(':').map(Number);
      const [endHour, endMin] = this.eventForm.endTime.split(':').map(Number);
      
      startDate = setMinutes(setHours(eventDate, startHour), startMin);
      endDate = setMinutes(setHours(eventDate, endHour), endMin);
    }

    const eventData = {
      title: this.eventForm.title.trim(),
      description: this.eventForm.description,
      start: startDate,
      end: endDate,
      allDay: this.eventForm.allDay
    };

    if (this.isEditMode && this.editingEvent) {
      // Update existing event
      const eventId = (this.editingEvent as any).id; // Assuming backend event has id
      this.calendarService.editCalendarEvent(eventId, eventData).subscribe({
        next: (updatedEvent) => {
          this.events = this.events.map(e => {
            if (e === this.editingEvent) {
              return {
                ...e,
                title: eventData.title,
                start: startDate,
                end: endDate,
                meta: {
                  description: eventData.description
                }
              };
            }
            return e;
          });
          this.refresh.next();
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
          this.events = [
            ...this.events,
            {
              ...newEvent,
              start: startDate,
              end: endDate,
              color: colors.blue,
              draggable: true,
              resizable: {
                beforeStart: true,
                afterEnd: true,
              },
              meta: {
                description: eventData.description
              }
            },
          ];
          this.refresh.next();
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
      const eventId = (this.editingEvent as any).id; // Assuming backend event has id
      this.calendarService.deleteCalendarEvent(eventId).subscribe({
        next: () => {
          this.events = this.events.filter(e => e !== this.editingEvent);
          this.refresh.next();
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
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
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
