import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Submission, SubmissionService } from '../../../core/services/submission.service';

@Component({
  selector: 'app-submissions-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatProgressSpinnerModule, ScrollingModule],
  templateUrl: './submissions-table.component.html',
  styleUrl: './submissions-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionsTableComponent implements OnInit, OnDestroy {
  private readonly submissionService = inject(SubmissionService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();
  private readonly scroll$ = new Subject<Event>();

  displayedColumns: string[] = ['id', 'name', 'status'];
  dataSource = new MatTableDataSource<Submission>([]);
  isLoadingMore = false;

  private allSubmissions: Submission[] = [];
  private currentPage = 1;

  ngOnInit(): void {
    this.loadPage(this.currentPage);
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.scroll$.complete();
  }

  private setupScrollListener(): void {
    this.scroll$
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => this.handleScroll(event));
  }

  private loadPage(page: number): void {
    if (this.isLoadingMore) {
      return;
    }

    this.isLoadingMore = true;
    this.submissionService
      .getSubmissions(page)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (submissions) => {
          this.allSubmissions = [...this.allSubmissions, ...submissions];
          this.dataSource.data = this.allSubmissions;
          this.isLoadingMore = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading submissions:', err);
          this.isLoadingMore = false;
          this.cdr.markForCheck();
        }
      });
  }

  private handleScroll(event: Event): void {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    if (distanceFromBottom < 50 && !this.isLoadingMore) {
      this.currentPage++;
      this.loadPage(this.currentPage);
    }
  }

  onScroll(event: Event): void {
    this.scroll$.next(event);
  }

  resetAndReload(): void {
    this.allSubmissions = [];
    this.dataSource.data = [];
    this.currentPage = 1;
    this.loadPage(this.currentPage);
  }
}
