import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-bug-report',
  templateUrl: './bug-report.component.html',
  styleUrls: ['./bug-report.component.scss'],
})
export class BugReportComponent {
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  bug = {
    title: '',
    description: '',
    email: '',
  };

  bugSubmitted = false;

  close() {
    this.closed.emit();
  }

  submit(form: any) {
    if (!form || !form.valid) return;
    console.log('Bug report submitted', this.bug);
    this.bugSubmitted = true;
    this.submitted.emit();
    setTimeout(() => this.closed.emit(), 1200);
  }
}
