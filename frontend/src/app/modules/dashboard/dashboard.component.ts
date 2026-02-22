// modules/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject, forkJoin, timer } from 'rxjs';
import { takeUntil, finalize, switchMap } from 'rxjs/operators';

import { AuthService }   from '../../core/services/auth.service';
import { RecordService } from '../../core/services/record.service';
import { User }          from '../../core/models/user.model';
import { Record }        from '../../core/models/record.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

  currentUser: User | null = null;
  records: Record[]        = [];
  dataSource               = new MatTableDataSource<Record>([]);

  loadingUser    = true;
  loadingRecords = true;
  errorMsg       = '';

  // Displayed columns vary by role
  displayedColumns: string[] = [];

  // Async delay control
  delayMs       = 0;
  asyncProgress = 0;   // 0–100 for the async progress bar
  asyncTimer: any;

  // Stats
  stats = { total: 0, completed: 0, inProgress: 0, pending: 0 };

  searchValue = '';

  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private recordSvc: RecordService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;
    this.loadingUser = false;

    // Set columns based on role
    this.displayedColumns = this.auth.isAdmin
      ? ['id', 'ownerName', 'title', 'category', 'priority', 'status', 'amount', 'updatedAt']
      : ['id', 'title', 'category', 'priority', 'status', 'amount', 'updatedAt'];

    this.loadRecords();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.asyncTimer) clearInterval(this.asyncTimer);
  }

  // ── Load records with optional delay ─────────────────────────────────────
  loadRecords(): void {
    this.loadingRecords = true;
    this.errorMsg       = '';
    this.asyncProgress  = 0;

    if (this.delayMs > 0) {
      this.startProgressSimulation();
    }

    this.recordSvc.getAll(this.delayMs)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingRecords = false;
          this.asyncProgress  = 100;
          if (this.asyncTimer) clearInterval(this.asyncTimer);
        })
      )
      .subscribe({
        next: res => {
          this.records    = res.data;
          this.dataSource.data = res.data;
          this.computeStats(res.data);
        },
        error: err => {
          this.errorMsg = err?.error?.message ?? 'Failed to load records.';
        }
      });
  }

  // ── Simulates progress bar during async wait ──────────────────────────────
  private startProgressSimulation(): void {
    if (this.asyncTimer) clearInterval(this.asyncTimer);
    const step    = 100 / (this.delayMs / 100);
    this.asyncTimer = setInterval(() => {
      if (this.asyncProgress < 90) { this.asyncProgress += step; }
    }, 100);
  }

  // ── Compute summary stats ─────────────────────────────────────────────────
  private computeStats(data: Record[]): void {
    this.stats = {
      total:      data.length,
      completed:  data.filter(r => r.status === 'Completed').length,
      inProgress: data.filter(r => r.status === 'In Progress').length,
      pending:    data.filter(r => r.status === 'Pending').length
    };
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  statusClass(status: string): string {
    const map: { [key: string]: string } = {
      'Completed':   'success',
      'In Progress': 'info',
      'Pending':     'warning'
    };
    return map[status] ?? 'default';
  }

  priorityClass(p: string): string {
    return p?.toLowerCase() ?? 'low';
  }

  formatAmount(val: string | number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      .format(Number(val));
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  logout(): void { this.auth.logout(); }
}
