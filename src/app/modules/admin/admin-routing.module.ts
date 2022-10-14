import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KeywordListComponent } from './components/keyword-list/keyword-list.component';
import { RecordingsComponent } from './components/recordings/recordings.component';
import { SavedSearchesComponent } from './components/saved-searches/saved-searches.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileComponent } from './components/profile/profile.component';
import { GroupsComponent } from './components/groups/groups.component';
import { GroupsGuard } from 'src/app/guards/groups.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: 'home', component: DashboardComponent },
      { path: 'settings', component: SettingsComponent },
      // {
      //   path: 'reports',
      //   loadChildren: () =>
      //     import('@convirza/athena').then((m) => m.AthenaModule),
      // },
      { path: 'keyword-list', component: KeywordListComponent },
      { path: 'recordings', component: RecordingsComponent },
      { path: 'groups', component: GroupsComponent, canActivate:[GroupsGuard] },
      { path: 'saved-searches', component: SavedSearchesComponent },
      { path: 'profile', children:[
        {path: '', component: ProfileComponent},
        // { path: 'profiledetail' , component: DetailsProfileComponent }
      ] },
      { path: '', redirectTo: '/admin/home', pathMatch: 'full' },

    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
