// src/app/layout/app-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-frame">
      <header class="iui-header">ProjectWise | Validate</header>
      <div class="app-body">
        <nav class="iui-side-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">🏠</a>
          <a routerLink="/document" routerLinkActive="active">📄</a>
        </nav>
        <main class="content"><router-outlet /></main>
      </div>
    </div>
  `,
  styles: [`
    .app-frame { display: flex; flex-direction: column; height: 100vh; }
    .app-body { display: flex; flex: 1; }
    .iui-side-nav { width: 64px; border-right: 1px solid #ddd; display: flex; flex-direction: column; align-items: center; padding-top: 20px; }
    .content { flex: 1; padding: 24px; background: #f8f9fb; }
    .active { color: #0078d4; font-weight: bold; }
  `]
})
export class AppLayoutComponent {}