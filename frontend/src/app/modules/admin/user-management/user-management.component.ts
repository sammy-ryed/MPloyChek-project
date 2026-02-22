// modules/admin/user-management/user-management.component.ts
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { UserDialogComponent, UserDialogData } from '../user-dialog/user-dialog.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  dataSource = new MatTableDataSource<User>([]);
  displayedColumns = ['avatar', 'name', 'userId', 'email', 'role', 'department', 'status', 'createdAt', 'actions'];

  loading  = true;
  delayMs  = 0;
  errorMsg = '';
  search   = '';

  private destroy$ = new Subject<void>();

  constructor(
    private userSvc: UserService,
    private auth: AuthService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadUsers(); }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadUsers(): void {
    this.loading  = true;
    this.errorMsg = '';
    this.userSvc.getAll(this.delayMs)
      .pipe(takeUntil(this.destroy$), finalize(() => (this.loading = false)))
      .subscribe({
        next:  res  => (this.dataSource.data = res.data),
        error: err  => (this.errorMsg = err?.error?.message ?? 'Failed to load users.')
      });
  }

  applyFilter(v: string): void {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(UserDialogComponent, {
      width: '520px',
      data: { mode: 'create' } as UserDialogData
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadUsers(); });
  }

  openEditDialog(user: User): void {
    const ref = this.dialog.open(UserDialogComponent, {
      width: '520px',
      data: { mode: 'edit', user } as UserDialogData
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadUsers(); });
  }

  toggleStatus(user: User): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    this.userSvc.update(user.id, { status: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snack.open(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}.`, 'OK', { duration: 3000 });
          this.loadUsers();
        },
        error: err => this.snack.open(err?.error?.message ?? 'Error updating status.', 'OK', { duration: 4000 })
      });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete user "${user.name}"? This action cannot be undone.`)) return;
    this.userSvc.delete(user.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snack.open('User deleted.', 'OK', { duration: 3000 });
          this.loadUsers();
        },
        error: err => this.snack.open(err?.error?.message ?? 'Error deleting user.', 'OK', { duration: 4000 })
      });
  }

  isSelf(user: User): boolean { return user.id === this.auth.currentUser?.id; }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  back(): void { window.history.back(); }
}
