import { Component, Input, forwardRef, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Utils } from '../../../../../SharedModules/Util/Utils';
import { keys, map as mapValue } from 'lodash';
/*Material Modules*/
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

import { CommonService } from "../../../../../SharedModules/Services/Common.service";


@Component({
  selector: 'app-tag-component',
  templateUrl: './Tag.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagComponent),
      multi: true
    }
  ]
})
export class TagComponent implements ControlValueAccessor {
  /*Globla variables*/
  public selectable = true;
  public removable = true;
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public tagCtrl = new FormControl();
  public filteredRecords: Observable<string[]>;
  public selectedOptions: any[] = [];
  public optionsList: any[] = [];
  public placeholder: string = "Enter tag name";
  public label: string = "Tags";
  tagsList$: Observable<any[]>;
  metaTagsList$: Observable<any[]>;

  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  @Input('data') data: any;
  @Input('selected') selectedObj: any;
  @Input('ph') ph: any;
  @Input('lb') lb: any;
  @Input('keyName') keyName: any;
  @Input('categoryName') categoryName: any;

  constructor(
    private commonService: CommonService
  ) {
  }

  public onChanged: any = () => { }
  public onTouched: any = () => { }

  public writeValue(): void {
  }
  ngOnChanges(Obj: SimpleChanges) {
    if ((Obj.selectedObj.currentValue) && (this.selectedObj.length)) {
      let tags: any = Utils.parse(this.selectedObj);
      let getKey: any = tags.length ? keys(tags[0]) : '';
      mapValue(tags, (value) => {
        this.selectedOptions.push({ [this.keyName]: value[getKey] });
      });
      this.onChanged(this.selectedOptions);
    }
    this.optionsList = this.data;
    this.placeholder = this.ph;
    this.label = this.lb;
    if (!(typeof (this.categoryName) == 'undefined')) {
      this.tagsList$ = this.commonService.get(`TagCollection/${this.categoryName}`);
    }
    else {
      return;
    }
    this.filteredRecords = this.tagCtrl.valueChanges.pipe(
      startWith(''),
      map((obj) => obj != undefined ? this._filter(obj) : obj != undefined ? this.optionsList.slice() : []));

    this.tagCtrl.valueChanges.subscribe(() => {
      this.onChanged(this.selectedOptions);
    });
  }

  public registerOnChange(fn: any): void {
    this.onChanged = fn
  }
  public registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  /*-----mat chip list---------*/
  public add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((event.value || '').trim()) {
      if (this.selectedOptions) {
        if (!this.selectedOptions.includes({ [this.keyName]: value.trim() }))
          this.selectedOptions.push({ [this.keyName]: value.trim() });

      } else {
        this.selectedOptions.push({ [this.keyName]: value.trim() })
      }
    }
    if (input) { input.value = ''; }
    this.tagCtrl.setValue(null);
  }

  public remove(obj: string): void {
    const index = this.selectedOptions.indexOf(obj);
    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
    }
  }

  public selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.selectedOptions.includes({ [this.keyName]: event.option.viewValue }))
      this.selectedOptions.push({ [this.keyName]: event.option.viewValue });
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.optionsList.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }
  /*End chip list*/

}