import {
  Component,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmissionsFormComponent } from './components/submissions-form.component';
import { SubmissionsTableComponent } from './components/submissions-table.component';

@Component({
  selector: 'app-submissions',
  standalone: true,
  imports: [CommonModule, SubmissionsFormComponent, SubmissionsTableComponent],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionsComponent {
  @ViewChild(SubmissionsTableComponent) tableComponent!: SubmissionsTableComponent;

  onFormSubmitted(): void {
    if (this.tableComponent) {
      this.tableComponent.resetAndReload();
    }
  }

  onFormClosed(): void {
    // Optional: Handle form closed event if needed
  }
}
