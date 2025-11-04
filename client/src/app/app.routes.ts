import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { TasksComponent } from './pages/tasks/tasks.component';
import { DailyRoutineComponent } from './pages/daily-routine/daily-routine.component';
import { StatsComponent } from './pages/stats/stats.component';
import { LoginComponent } from './features/account/login/login.component';
import { RegisterComponent } from './features/account/register/register.component';
import { AccountComponent } from './pages/account/account.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'calendar', component: CalendarComponent },
	{ path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
	{ path: 'daily-routine', component: DailyRoutineComponent, canActivate: [AuthGuard] },
	{ path: 'stats', component: StatsComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
	// logout is handled by the navbar action; keep a route to redirect to home
	{ path: 'logout', component: HomeComponent }
];
