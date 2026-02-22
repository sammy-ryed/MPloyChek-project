// modules/admin/admin.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatTableModule }        from '@angular/material/table';
import { MatSortModule }         from '@angular/material/sort';
import { MatPaginatorModule }    from '@angular/material/paginator';
import { MatIconModule }         from '@angular/material/icon';
import { MatButtonModule }       from '@angular/material/button';
import { MatFormFieldModule }    from '@angular/material/form-field';
import { MatInputModule }        from '@angular/material/input';
import { MatSelectModule }       from '@angular/material/select';
import { MatDialogModule }       from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule }     from '@angular/material/snack-bar';
import { MatSliderModule }       from '@angular/material/slider';
import { MatTooltipModule }      from '@angular/material/tooltip';

import { UserManagementComponent } from './user-management/user-management.component';
import { UserDialogComponent }     from './user-dialog/user-dialog.component';
import { AuthGuard }  from '../../core/guards/auth.guard';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  { path: '', redirectTo: 'users', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    UserManagementComponent,
    UserDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSliderModule,
    MatTooltipModule
  ]
})
export class AdminModule {}
