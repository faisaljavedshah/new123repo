import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RecordingsComponent } from './components/recordings/recordings.component';
import { KeywordListComponent } from './components/keyword-list/keyword-list.component';
import { SavedSearchesComponent } from './components/saved-searches/saved-searches.component';
import { SettingsComponent } from './components/settings/settings.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { OtherSideNavComponent } from './components/other-side-nav/other-side-nav.component';
import { RecordingsTableComponent } from './components/recordings-table/recordings-table.component';
import { MatTableModule } from '@angular/material/table';

import { NgxAudioPlayerModule } from 'ngx-audio-player';
import { AngMusicPlayerModule } from 'ang-music-player';
import { VimeModule } from '@vime/angular';
import { PlayerComponent } from './components/player/player.component';
import { RecordingListComponent } from './components/recording-list/recording-list.component';
import { MatSortModule } from '@angular/material/sort';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { WorldCloudChartComponent } from './components/dashboard/world-cloud-chart/world-cloud-chart.component';
import { SolidGuageChartComponent } from './components/dashboard/solid-guage-chart/solid-guage-chart.component';
import { PackedCircleChartComponent } from './components/dashboard/packed-circle-chart/packed-circle-chart.component';
import { SankeyDiagrameComponent } from './components/dashboard/sankey-diagrame/sankey-diagrame.component';
import { PolarAreaComponent } from './components/dashboard/polar-area/polar-area.component';
import { MatTabsModule } from '@angular/material/tabs';
import { RecordingAnalysisTabComponent } from './components/recording-list/recording-analysis-tab/recording-analysis-tab.component';
import { RecordingListPlayerComponent } from './components/player/recording-list-player/recording-list-player.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatTreeModule } from '@angular/material/tree';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';

import { DetailsProfileComponent } from './components/profile/details-profile/details-profile.component';
import { GraphsComponent } from './components/dashboard/graphs/graphs.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { PeriodicTableComponent } from './components/dashboard/periodic-table/periodic-table.component';
import { PeriodicTablesComponent } from './components/dashboard/periodic-tables/periodic-tables.component';
import { TeamsComponent } from './components/keyword-list/teams/teams.component';
import { GroupsComponent } from './components/groups/groups.component';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BreadCrumbsComponent } from './components/bread-crumbs/bread-crumbs.component';
@NgModule({
  declarations: [
    AdminDashboardComponent,
    HeaderComponent,
    SidebarComponent,
    RecordingsComponent,
    KeywordListComponent,
    SavedSearchesComponent,
    SettingsComponent,
    DashboardComponent,
    OtherSideNavComponent,
    RecordingsTableComponent,
    PlayerComponent,
    RecordingListComponent,
    DashboardHeaderComponent,
    WorldCloudChartComponent,
    SolidGuageChartComponent,
    PackedCircleChartComponent,
    SankeyDiagrameComponent,
    PolarAreaComponent,
    RecordingAnalysisTabComponent,
    RecordingListPlayerComponent,
    ProfileComponent,
    ProfileHeaderComponent,
    DetailsProfileComponent,
    PeriodicTableComponent,
    PeriodicTablesComponent,
    GraphsComponent,
    TeamsComponent,

    GroupsComponent,
    BreadCrumbsComponent,
  ],
  imports: [
    SharedModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    AdminRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    // * Mat modules
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatSelectModule,
    // flex layout
    FlexLayoutModule,
    // * angular matrrial form for login
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTreeModule,
    NgbModule,

    MatTableModule,
    NgxAudioPlayerModule,
    AngMusicPlayerModule,
    VimeModule,
    MatSortModule,
    AmChartsModule,
    NgApexchartsModule,
    MatTabsModule,
    MatProgressBarModule,

    MatPaginatorModule,
    MatExpansionModule,
    MatRadioModule,
    DragDropModule,
    NgxDaterangepickerMd.forRoot()
  ],
  providers: [
    { provide: MAT_TABS_CONFIG, useValue: { animationDuration: '0ms' } }
  ]
})
export class AdminModule {}
