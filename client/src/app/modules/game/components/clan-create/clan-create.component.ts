import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResourceService } from '../../../../shared/services/resource.service';
import { Resources } from '../../../../shared/models/resources.model';

@Component({
  selector: 'app-clan-create',
  templateUrl: './clan-create.component.html',
  styleUrls: ['./clan-create.component.scss'],
})
export class ClanCreateComponent implements OnInit {
  form: FormGroup;
  players = [
    { id: 2, label: 'PlayerA' },
    { id: 3, label: 'PlayerB' },
    { id: 4, label: 'PlayerC' },
    { id: 5, label: 'PlayerD' },
  ];

  readonly clanCost: Partial<Resources> = { wood: 500, clay: 300, iron: 200 };

  constructor(private fb: FormBuilder, private resSvc: ResourceService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      members: [[]],
    });
  }

  ngOnInit(): void {}

  createClan() {
    if (this.form.invalid) return;
    if (!this.resSvc.spendResources(this.clanCost)) {
      alert('Za mało surowców na utworzenie klanu');
      return;
    }

    const payload = {
      name: this.form.get('name')?.value,
      invited: this.form.get('members')?.value || [],
    };

    console.log('Utworzono klan', payload);
    alert('Klan utworzony! (symulacja)');
    this.form.reset({ name: '', members: [] });
  }
}
