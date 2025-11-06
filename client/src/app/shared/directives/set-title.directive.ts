import { Directive, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Directive({
  selector: '[setTitle]',
})
export class SetTitleDirective implements OnInit {
  @Input('appSetTitle') pageTitle!: string;

  constructor(private readonly titleService: Title) {}

  ngOnInit(): void {
    if (this.pageTitle) {
      this.titleService.setTitle(this.pageTitle);
    }
  }
}
