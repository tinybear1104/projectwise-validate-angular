import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';
import { SubmissionsComponent } from './features/submissions/submissions.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', component: SubmissionsComponent },
      { path: 'document', loadComponent: () => import('./features/documents/documents.component').then(m => m.DocumentsComponent) }
    ]
  }
];