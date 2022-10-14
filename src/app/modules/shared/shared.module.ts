import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OutsideDirective } from 'src/app/outside.directive';
import { GuageChartComponent } from '../admin/components/recording-list/guage-chart/guage-chart.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgApexchartsModule } from 'ng-apexcharts';


@NgModule({
  declarations: [OutsideDirective, GuageChartComponent],
  imports: [
    CommonModule,
    MatCheckboxModule,
    NgApexchartsModule
  ],
  exports : [OutsideDirective, GuageChartComponent, MatCheckboxModule, NgApexchartsModule]

})
export class SharedModule { }
