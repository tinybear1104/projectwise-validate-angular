import {
  Component,
  Output,
  EventEmitter,
  inject,
  ChangeDetectionStrategy,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SubmissionFacade } from '../services/submission.facade';

@Component({
  selector: 'app-submissions-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './submissions-form.component.html',
  styleUrl: './submissions-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubmissionsFormComponent {
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  private facade = inject(SubmissionFacade);
  private fb = inject(FormBuilder);

  submissionForm!: FormGroup;
  showForm = signal(false);
  loading$ = this.facade.loading;

  constructor() {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.submissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      revision: ['', [Validators.required, Validators.pattern(/^v\d+$/)]],
      status: ['Pending', Validators.required],
      decision: ['Awaiting', Validators.required]
    });
  }

  toggleForm(): void {
    this.showForm.update(value => !value);
    if (!this.showForm()) {
      this.submissionForm.reset({ status: 'Pending', decision: 'Awaiting' });
    }
  }

  onCancel(): void {
    this.toggleForm();
    this.formClosed.emit();
  }

  onSubmit(): void {
    if (this.submissionForm.valid) {
      const newSubmission = this.submissionForm.value;
      this.facade.createSubmission(newSubmission).subscribe({
        next: () => {
          this.submissionForm.reset({ status: 'Pending', decision: 'Awaiting' });
          this.showForm.set(false);
          this.formSubmitted.emit();
        },
        error: (error) => {
          console.error('Error creating submission:', error);
        }
      });
    }
  }
}
