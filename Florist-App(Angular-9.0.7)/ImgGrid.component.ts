/***Angular Core Module***/
import { Component, Input, forwardRef, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

/***Services ***/
import { ProductService } from '../../../Modules/Products/Services/Product.service';

/***Data Models ***/
import { DeleteModalModel } from 'projects/Admin/src/app/SharedModules/Models/DeleteModal.Model';

/***Material Module***/
import { MatDialog } from '@angular/material/dialog';

/***Lodash ***/
import { Utils } from 'projects/Admin/src/app/SharedModules/Util/Utils';

/***Enviornment variables ***/
import { environment } from 'projects/Admin/src/environments/environment';

@Component({
  selector: 'app-img-grid',
  templateUrl: './ImgGrid.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImgGridComponent),
      multi: true
    }
  ]
})

export class ImgGridComponent implements ControlValueAccessor {
  /*Globla Variables*/
  public imgCntrl = new FormControl();
  public selectedOptions: any[] = [];
  public filteredRecords: Observable<string[]>;
  public optionsList: any[] = [];

  @Input('selected') selectedObj: any;
  /*path for display of img*/
  public imgPath: string = `${environment.imageUrl}`;
  /*FormData variable to send blob image*/
  fileToUpload: FormData;
  /*Image functions variables starts*/
  color: string = 'ffffff'
  imageUrl: string | ArrayBuffer;
  showEditFields: any = "";
  editData: any[] = [];
  productImages: any[] = [];
  apiImage: any;
  /*Image functions variables ends */
  constructor(
    public dialog: MatDialog,
    private productService: ProductService
  ) { }

  public onChanged: any = () => { }
  public onTouched: any = () => { }
  public registerOnChange(fn: any): void {
    this.onChanged = fn
  }
  public registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  public writeValue(obj: any[]): void {
    console.log(obj);
  }

  ngOnChanges(Obj: SimpleChanges) {
    if ((Obj.selectedObj.currentValue) && (this.selectedObj.length)) {
      let images: any = Utils.parse(this.selectedObj);
      this.selectedOptions.push(images[0]);
      this.productImages.push(images[0]);
      this.productImages.forEach(x => {
        x.isEditMode = true;
      });
      // });
      console.log(this.selectedOptions);
      this.onChanged(this.selectedOptions);
    }

    this.imgCntrl.valueChanges.subscribe(() => {
      this.onChanged(this.selectedOptions);
    });
  }
  //image upload functions
  public imgUpload($event) {
    var reader = new FileReader();
    const file = $event.target.files[0];
    let formData: FormData = new FormData();
    formData.append("file", file);
    this.fileToUpload = formData;
    this.productService.saveImage(this.fileToUpload).subscribe(response => {
      let value = Object.values(response);
      this.apiImage = value[0];
      this.selectedOptions.push({ ImageName: this.apiImage, isCoverImage: true, altText: null, imageTags: [] });
    })
    reader.readAsDataURL(file);
    reader.onload = function () {
    };
  }
  /*for preview of image*/
  public onChange(file: File) {

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => { //event
        this.imageUrl = reader.result;
        this.productImages.push({ ImageName: this.imageUrl, isCoverImage: true, altText: null, imageTags: [], isEditMode: false })
        this.editData.push({ altText: false, imageTags: false });
      };
    }
  }

  /*image upload functions*/
  public imgUploadEdit($event, index) {
    var reader = new FileReader();
    const file = $event.target.files[0];
    let formData: FormData = new FormData();
    formData.append("file", file);
    this.fileToUpload = formData;
    this.productService.saveImage(this.fileToUpload).subscribe(response => {
      let value = Object.values(response);
      this.apiImage = value[0];
      this.selectedOptions[index].ImageName = this.apiImage;
      this.productImages[index].ImageName = this.apiImage;
    })
    reader.readAsDataURL(file);
    reader.onload = function () {
    };
  }

  /*For Browse more image*/
  public onChangeEdit(file: File) {
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        this.imageUrl = reader.result;
        console.log(event);
      };
    }
  }
  /*For delete image*/
  public deleteImage(index) {
    const model = new DeleteModalModel();
    model.title = 'Image Delete';
    model.description = 'Are you sure you want to permanently delete this image?';
    model.waitDescription = 'Image is deleting...';
    const dialogRef = this.productService.deleteElement(model);
    dialogRef.afterClosed().subscribe(res => {
      if (!res) {
        return;
      }
      this.productImages.splice(index, 1);
    });

  }
  /*For setting image as favorite*/
  public addFavourite(index) {
    if (this.productImages[index].isCoverImage == false) {
      this.productImages.forEach(x => {
        x.isCoverImage = false;
      });
      this.productImages[index].isCoverImage = true;
    }
    else {
      this.productImages[index].isCoverImage = false;
    }
  }
  /*Edit image functions starts*/
  public changeImage(index) {
    if (index > 0 || index == 0) {
      for (var i = 0; i < this.productImages.length; i++) {
        if (this.productImages[i].isChange == true) {
          this.productImages[i].isChange = false;
        }
      }
    }
    this.productImages[index].isChange = true;
  }

  public editImage(index) {
    if (index > 0 || index == 0) {
      for (var i = 0; i < this.productImages.length; i++) {
        if (this.productImages[i].isEdit == true) {
          this.productImages[i].isEdit = false;
        }
      }
    }
    this.productImages[index].isEdit = true;
    if (this.showEditFields == true) {
      this.showEditFields = false;
    }
    else {
      this.showEditFields = true;
    }
  }
  public saveImageEdit() {
    this.showEditFields = false;
  }
  /*Edit image functions ends*/

}