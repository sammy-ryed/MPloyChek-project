// modules/admin/user-dialog/user-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { UserService, CreateUserPayload, UpdateUserPayload } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss']
})
export class UserDialogComponent implements OnInit {

  form!: FormGroup;
  saving       = false;
  hidePassword = true;
  errorMsg     = '';

  readonly roles        = ['General User', 'Admin'];
  readonly departments  = ['Technology', 'Finance', 'Operations', 'Sales', 'HR', 'General'];
  readonly statusOptions = ['active', 'inactive'];

  get isEdit():   boolean { return this.data.mode === 'edit'; }
  get isCreate(): boolean { return this.data.mode === 'create'; }

  constructor(
    private fb: FormBuilder,
    private userSvc: UserService,
    private snack: MatSnackBar,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {}

  ngOnInit(): void {
    const u = this.data.user;
    this.form = this.fb.group({
      userId:     [u?.userId     ?? '', this.isCreate ? [Validators.required, Validators.minLength(3)] : []],
      name:       [u?.name       ?? '', [Validators.required]],
      email:      [u?.email      ?? '', [Validators.required, Validators.email]],
      role:       [u?.role       ?? 'General User', [Validators.required]],
      department: [u?.department ?? 'General',      [Validators.required]],
      status:     [u?.status     ?? 'active'],
      password:   ['', this.isCreate ? [Validators.required, Validators.minLength(6)] : [Validators.minLength(6)]]
    });

    if (this.isEdit) {
      this.form.get('userId')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.saving  = true;
    this.errorMsg= '';
    const val = this.form.getRawValue();

    const obs$ = this.isCreate
      ? this.userSvc.create(val as CreateUserPayload)
      : this.userSvc.update(this.data.user!.id, {
          name:       val.name,
          email:      val.email,
          role:       val.role,
          department: val.department,
          status:     val.status,
          ...(val.password ? { password: val.password } : {})
        } as UpdateUserPayload);

    obs$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: res => {
        this.snack.open(
          this.isCreate ? 'User created successfully.' : 'User updated successfully.',
          'OK', { duration: 3000 }
        );
        this.dialogRef.close(true);
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'An error occurred. Please try again.';
      }
    });
  }

  field(n: string) { return this.form.get(n); }

  cancel(): void { this.dialogRef.close(false); }
}
