import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="docs-container">
      <div class="header-row">
        <h1 class="iui-text-headline">Document Management</h1>
        <div class="actions">
          <input type="file" #fileInput (change)="onFileSelected($event)" style="display: none">
          <button class="iui-button" (click)="fileInput.click()">
            Upload Document
          </button>
        </div>
      </div>

      <div class="iui-table-container">
        <table class="iui-table">
          <thead class="iui-table-header">
            <tr class="iui-table-row">
              <th class="iui-table-header-cell sortable" (click)="toggleSort()">
                Name
                <span class="sort-indicator">{{ sortIndicator() }}</span>
              </th>
              <th class="iui-table-header-cell">Type</th>
              <th class="iui-table-header-cell">Size</th>
              <th class="iui-table-header-cell">Date Uploaded</th>
              <th class="iui-table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody class="iui-table-body">
            @for (doc of sortedDocuments(); track doc.id) {
              <tr class="iui-table-row">
                <td class="iui-table-cell text-blue">{{ doc.name }}</td>
                <td class="iui-table-cell">{{ doc.type }}</td>
                <td class="iui-table-cell">{{ doc.size }}</td>
                <td class="iui-table-cell">{{ doc.uploadDate }}</td>
                <td class="iui-table-cell">
                  <button class="delete-btn" (click)="deleteDocument(doc.id)" title="Delete document">
                    Delete
                  </button>
                </td>
              </tr>
            } @empty {
              <tr class="iui-table-row">
                <td class="iui-table-cell" colspan="5" style="text-align: center; padding: 2rem;">
                  No documents found. Click upload to add one.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .docs-container { display: flex; flex-direction: column; gap: 1.5rem; height: 100vh; }
    .header-row { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; flex-shrink: 0; }
    .text-blue { color: #0078d4; cursor: pointer; font-weight: 500; }
    .text-blue:hover { text-decoration: underline; }
    .iui-table-container { background: white; border: 1px solid #d1d1d1; border-radius: 4px; overflow-y: auto; flex: 1; }
    .iui-button { padding: 8px 16px; background-color: #0078d4; color: white; border: none; border-radius: 4px; font-size: 14px; cursor: pointer; transition: background-color 0.2s ease; }
    .iui-button:hover { background-color: #005a9e; }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { background-color: #f0f0f0; }
    .sort-indicator { margin-left: 6px; font-size: 12px; color: #0078d4; font-weight: bold; }
    .iui-button:disabled { background-color: #ccc; cursor: not-allowed; }
    .delete-btn { background-color: #d13438; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 2px; cursor: pointer; font-size: 0.875rem; }
    .delete-btn:hover { background-color: #a4373a; }
  `]
})
export class DocumentsComponent {
  private documentService = inject(DocumentService);
  documents = signal<DocumentItem[]>([]);
  sortAscending = signal(true);
  
  // Computed signal for sorted documents
  sortedDocuments = computed(() => {
    const docs = this.documents().slice();
    docs.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return this.sortAscending() ? comparison : -comparison;
    });
    return docs;
  });
  
  // Computed signal for sort indicator
  sortIndicator = computed(() => {
    return this.sortAscending() ? '↑' : '↓';
  });
  
  constructor() {
    // Load documents from the service
    this.documentService.getDocuments().subscribe(docs => {
      const items: DocumentItem[] = docs.map(doc => ({
        id: doc.id,
        name: doc.title,
        type: doc.title.split('.').pop()?.toUpperCase() || 'Document',
        size: 'N/A',
        uploadDate: doc.createdAt
      }));
      this.documents.set(items);
    });
  }

  toggleSort(): void {
    this.sortAscending.update(value => !value);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Update the signal with the new "mock" document
      const newDoc: DocumentItem = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'Unknown',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date().toISOString().split('T')[0]
      };

      this.documents.update(docs => [newDoc, ...docs]);
    }
  }

  deleteDocument(id: string) {
    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        // Remove the deleted document from the list
        this.documents.update(docs => docs.filter(doc => doc.id !== id));
      },
      error: (err) => {
        console.error('Failed to delete document:', err);
      }
    });
  }
}
