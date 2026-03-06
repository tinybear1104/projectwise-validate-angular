import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Submission {
  id: string;
  name: string;
  revision: string;
  status: string;
  decision: string;
}

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';
  private readonly pageSize = 10;

  private readonly cache = new Map<number, Observable<Submission[]>>();

  getSubmissions(page: number = 1): Observable<Submission[]> {
    if (this.cache.has(page)) {
      return this.cache.get(page)!;
    }

    const observable$ = this.http
      .get<any[]>(`${this.apiUrl}?_start=${(page - 1) * this.pageSize}&_limit=${this.pageSize}`)
      .pipe(
        map((items) =>
          items.map((item) => ({
            id: String(item.id),
            name: item.title,
            revision: `v${item.userId}`,
            status: 'Pending',
            decision: 'Awaiting'
          }))
        ),
        shareReplay(1),
        catchError((error) => {
          console.error('Failed to fetch submissions:', error);
          return of([]);
        })
      );

    this.cache.set(page, observable$);
    return observable$;
  }

  getSubmissionById(id: string): Observable<Submission> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((item) => ({
        id: String(item.id),
        name: item.title,
        revision: `v${item.userId}`,
        status: 'Pending',
        decision: 'Awaiting'
      })),
      catchError((error) => {
        console.error('Failed to fetch submission:', error);
        return of({ id, name: '', revision: '', status: '', decision: '' });
      })
    );
  }

  createSubmission(submission: Omit<Submission, 'id'>): Observable<Submission> {
    return this.http.post<any>(this.apiUrl, submission).pipe(
      map((item) => ({
        id: String(item.id),
        name: submission.name,
        revision: submission.revision,
        status: submission.status,
        decision: submission.decision
      })),
      catchError((error) => {
        console.error('Failed to create submission:', error);
        throw error;
      })
    );
  }

  updateSubmission(id: string, submission: Partial<Submission>): Observable<Submission> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, submission).pipe(
      map((item) => ({
        id: String(item.id || id),
        name: item.title || submission.name || '',
        revision: submission.revision || '',
        status: submission.status || '',
        decision: submission.decision || ''
      })),
      catchError((error) => {
        console.error('Failed to update submission:', error);
        throw error;
      })
    );
  }

  deleteSubmission(id: string): Observable<void> {
    this.cache.delete(Number(id));
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error('Failed to delete submission:', error);
        throw error;
      })
    );
  }
}
