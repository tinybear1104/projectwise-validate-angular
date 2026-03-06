import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SubmissionService, Submission } from '../../../core/services/submission.service';
import { NotificationService } from '../../../core/services/notification.service';

@Injectable({ providedIn: 'root' })
export class SubmissionFacade {
  private submissionService = inject(SubmissionService);
  private notificationService = inject(NotificationService);

  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  readonly loading = this.loading$.asObservable();
  readonly error = this.error$.asObservable();

  getSubmissions(page: number): Observable<Submission[]> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.submissionService.getSubmissions(page).pipe(
      tap(
        () => {
          this.loading$.next(false);
        },
        (error) => {
          this.error$.next(error.message || 'Failed to load submissions');
          this.loading$.next(false);
        }
      )
    );
  }

  createSubmission(submission: Omit<Submission, 'id'>): Observable<Submission> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.submissionService.createSubmission(submission).pipe(
      tap(
        (result) => {
          this.loading$.next(false);
          this.notificationService.success('Submission created successfully');
        },
        (error) => {
          this.error$.next(error.message || 'Failed to create submission');
          this.loading$.next(false);
          this.notificationService.error('Failed to create submission');
        }
      )
    );
  }

  updateSubmission(id: string, submission: Partial<Submission>): Observable<Submission> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.submissionService.updateSubmission(id, submission).pipe(
      tap(
        () => {
          this.loading$.next(false);
          this.notificationService.success('Submission updated successfully');
        },
        (error) => {
          this.error$.next(error.message || 'Failed to update submission');
          this.loading$.next(false);
          this.notificationService.error('Failed to update submission');
        }
      )
    );
  }

  deleteSubmission(id: string): Observable<void> {
    this.loading$.next(true);
    this.error$.next(null);

    return this.submissionService.deleteSubmission(id).pipe(
      tap(
        () => {
          this.loading$.next(false);
          this.notificationService.success('Submission deleted successfully');
        },
        (error) => {
          this.error$.next(error.message || 'Failed to delete submission');
          this.loading$.next(false);
          this.notificationService.error('Failed to delete submission');
        }
      )
    );
  }
}
