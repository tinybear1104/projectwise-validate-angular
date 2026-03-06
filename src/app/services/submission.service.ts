// src/app/services/submission.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Submission {
  id: string;
  name: string;
  revision: string;
  status: string;
  decision: string;
}

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private http = inject(HttpClient);
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';
  private pageSize = 10;

  getSubmissions(page: number = 1): Observable<Submission[]> {
    // Fetch more than needed for pagination
    return this.http.get<any[]>(`${this.apiUrl}?_start=${(page - 1) * this.pageSize}&_limit=${this.pageSize}`).pipe(
      map(items => 
        items.map(item => ({
          id: String(item.id),
          name: item.title,
          revision: `v${item.userId}`,
          status: 'Pending',
          decision: 'Awaiting'
        }))
      )
    );
  }

  getSubmissionById(id: string): Observable<Submission> {
    return this.http.get<Submission>(`${this.apiUrl}/${id}`);
  }

  createSubmission(submission: Omit<Submission, 'id'>): Observable<Submission> {
    return this.http.post<Submission>(this.apiUrl, submission);
  }

  updateSubmission(id: string, submission: Partial<Submission>): Observable<Submission> {
    return this.http.put<Submission>(`${this.apiUrl}/${id}`, submission);
  }

  deleteSubmission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}