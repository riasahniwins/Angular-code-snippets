/*Angular Code Modules*/
import { Component, forwardRef } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/*Lodash*/

@Component({
    selector: 'app-atb-component',
    templateUrl: './Atb.component.html',
    styleUrls: ['./Atb.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AtbComponent),
            multi: true
        }
    ]
})
export class AtbComponent implements ControlValueAccessor {
    // @Input('comp') comp: any;
    public attributeForm = new FormArray([]);

    constructor() {
        this.attributeForm.valueChanges.subscribe(res => {
            this.onChanged(res);
        });
    }

    public addNewAttribute() {
        const group = new FormGroup({
            id: new FormControl(''),
            name: new FormControl(''),
            value: new FormControl(''),
            tag: new FormControl('')
        });
        this.attributeForm.push(group);
    }

    removeAttribute(index) {
        this.attributeForm.removeAt(index);
    }

    public onChanged: any = () => { }
    public onTouched: any = () => { }

    public writeValue(obj: any): void {
        let group: any;
        if (obj) {
            obj.forEach((data => {
                group = new FormGroup({
                    id: new FormControl(data['AttributeId']),
                    name: new FormControl(data['AttributesName']),
                    value: new FormControl(data['AttributesValue']),
                    tag: new FormControl(data['Tag'])
                });
                this.attributeForm.push(group);
            }))
        }
    }

    public registerOnChange(fn: any): void {
        this.onChanged = fn
    }
    public registerOnTouched(fn: any): void {
        this.onTouched = fn
    }

}