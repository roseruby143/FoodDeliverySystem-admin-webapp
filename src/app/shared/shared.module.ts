import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarComponent } from './star/star.component';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    StarComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    StarComponent,
    NgxPaginationModule
  ]
})
export class SharedModule { }
