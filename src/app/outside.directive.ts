import {Input, Output, Directive, ElementRef, EventEmitter, HostListener, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import { AppComponent } from './app.component';
@Directive({
  selector: '[clickOutside]'
})
export class OutsideDirective {
  constructor(private _elementRef: ElementRef, @Inject(DOCUMENT) private document: Document) {
  }

  @Input('clickOutsideExclude') exclude = [];

  @Output()
  public clickOutside = new EventEmitter();

  @HostListener('document:click', ['$event'])
  public onClick(event) {
    const clickedInside = this._elementRef.nativeElement.contains(event.target);
    const clickedExclusions = this.exclude.some(
      (selector) => Array.from(
        this.document.querySelectorAll(selector)
        ).some((element:HTMLElement): boolean => element.contains(event.target)))
    if (!clickedInside && !clickedExclusions ) {
      this.clickOutside.emit(null);
    }
  }
}
