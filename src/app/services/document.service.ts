import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface JSONPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  private mapToDocument(post: JSONPlaceholderPost): Document {
    const mockDate = new Date().toISOString();
    return {
      id: post.id.toString(),
      title: post.title,
      content: post.body,
      createdAt: mockDate,
      updatedAt: mockDate
    };
  }

  getDocumentById(id: string): Observable<Document> {
    return this.http.get<JSONPlaceholderPost>(`${this.apiUrl}/${id}`).pipe(
      map(post => this.mapToDocument(post))
    );
  }

  getDocuments(): Observable<Document[]> {
    return this.http.get<JSONPlaceholderPost[]>(this.apiUrl).pipe(
      map(posts => posts.map(post => this.mapToDocument(post)))
    );
  }

  createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Observable<Document> {
    return this.http.post<Document>(this.apiUrl, document);
  }

  updateDocument(id: string, document: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, document);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
