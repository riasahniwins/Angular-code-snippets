/***Angular Core Module***/
import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet, Router, ActivationStart, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { startWith } from 'rxjs/internal/operators/startWith';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

/***Models Classes***/
import { ProductLables } from '../../Models/ProLabel.model';
import { ProductSize } from '../../Models/ProductSize.model';
import { ProductModel } from '../../Models/Product.Model';

/*Material Module*/
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackbarComponent } from 'projects/Admin/src/app/SharedModules/Components/mat-snackbar/mat-snackbar.component';

/***Services***/
import { ProductService } from '../../Services/Product.service';
import { Utils } from 'projects/Admin/src/app/SharedModules/Util/Utils';


/***lodash***/
import { isNil } from 'lodash';
import * as _ from 'lodash';
import { userData } from 'projects/Admin/src/app/SharedModules/Models/userDataModel.model';
import { CommonService } from 'projects/Admin/src/app/SharedModules/Services/Common.service';


const AVAILABLE_STATUS: string[] =
  ['Active', 'Inactive'];

@Component({
  selector: 'app-product',
  templateUrl: './productadd.component.html',
  styleUrls: ['./productadd.component.scss']
})

export class ProductaddComponent implements OnInit {
  @ViewChild(RouterOutlet) outlet: RouterOutlet;
  //all string and any variables
  color: string = 'ffffff'
  products: any;
  message: string = null;
  vendorsData: Observable<any[]>;
  colorData: any = [];
  productLocations: any;
  // form and model initialisations
  product: ProductModel;
  productForm: FormGroup;
  addOnsForm = new FormArray([]);
  filteredVendors: Observable<string[]>;

  //all boolean declarations
  hasFormErrors: boolean = false;
  showColorPalette: boolean = false;
  isLoading: boolean = false;
  //array declarations
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  colors: any[] = [];
  tags: any[] = [];
  metaKeywords: any[] = [];
  productTags: any[];
  vendors: any[] = [];
  images: any[] = [];
  vendorList: string[] = [];
  stockAvailabilityStatus: any[] = [{ name: 'Limited' }, { name: 'Unlimited' }, { name: 'No Stock' }];

  proTag$: Observable<any[]>;
  metaTag$: Observable<any[]>;
  addonsList$: Observable<any[]>;
  productSize = new FormArray([])
  globalSizes: any[];

  public user: userData;
  public waitingText = "Save";


  //declrations for product add request
  public attributesVar = [];
  public addOnsVar = [];
  public pricesVar = [];
  public vendorsVar = [];
  public imagesVar = [];

  public productLabels: ProductLables;

  constructor(
    private router: Router,
    private productFB: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private productService: ProductService,
    private snackbar: MatSnackbarComponent,
    private commonService: CommonService
  ) {
    this.user = this.commonService.user;
  }


  ngOnInit(): void {
    this.getColorCodes();
    this.getVendorsData();
    this.searchProductAddon();

    this.productLabels = new ProductLables;
    this.route.queryParams.subscribe(params => {
      const id = params.productId;
      if (!isNil(id)) {
        this.productLabels.title = "Edit Product";
        this.productLabels.saveBtn = false;
        this.getProductDetail(id)
      } else {
        this.getSize()
      }
    })

    this.router.events.subscribe(e => {
      if (e instanceof ActivationStart && e.snapshot.outlet === "administration")
        this.outlet.deactivate();
    });

    this.createForm();
  }
  /*For product addons*/
  searchProductAddon() {
    let queryParams = {
      FloristId: this.user.floristId,
      LocationId: this.user.locationId,
    }
    this.addonsList$ = this.productService.getAddonProduct(queryParams);
  }
  /*For product sizes*/
  getSize() {
    this.productService.getProductSize().subscribe(res => {
      this.globalSizes = res;
      let ps = new ProductSize;
      res.forEach(element => {
        const obj = {};
        obj["size"] = element.codeName;
        obj["sizeOptionId"] = Number(element.globalCodeId);
        obj["costPrice"] = ps.costPrice,
          obj["regularPrice"] = ps.regularPrice,
          obj["salePrice"] = ps.salePrice,
          obj["notTaxable"] = ps.notTaxable

        let a = this.productForm.get('prices') as FormArray;
        a.push(this.createSize(obj));

      });
    });
  }
  /*For product sizes*/
  createSize(e?): FormGroup {
    console.log(e.codeName)
    return this.productFB.group({
      size: e.size,
      ProductPriceOptionId: e.ProductPriceOptionId,
      sizeOptionId: e.sizeOptionId,
      costPrice: e.costPrice,
      regularPrice: e.regularPrice,
      salePrice: e.salePrice,
      notTaxable: e.notTaxable
    });
  }

  /*initialising the form with validators*/
  public createForm() {
    this.product = new ProductModel();
    this.productForm = this.productFB.group({
      floristId: [this.user.floristId],
      locationId: [this.user.locationId],
      productId: [0],
      name: [this.product.name, [Validators.required, Validators.pattern(/\S/)]],
      addOns: [false],
      isActive: [false],
      description: [this.product.description],
      shortDescription: [this.product.shortDescription, [Validators.required, Validators.pattern(/\S/)]],
      metaDescription: [this.product.metaDescription],
      metaKeywords: [this.metaKeywords],
      tags: [this.tags],
      images: [this.images],
      addOnsProducts: [this.product.addOnsProducts],
      colors: [this.colors],
      stockQuantity: [0],
      stockAvailability: [this.product.stockAvailability, [Validators.required, Validators.pattern(/\S/)]],
      vendors: [this.vendors],
      mobileApp: [false],
      bloomrunner: [false],
      walkIn: [false],
      facebook: [false],
      instagram: [false],
      attributes: [],
      prices: this.productFB.array([])//this.prices
    });
    this.product.mobileApp = false;
    this.product.bloomrunner = false;
    this.product.walkIn = false;
    this.product.facebook = false;
    this.product.instagram = false;
    this.filteredVendors = this.productForm.controls.vendors.valueChanges
      .pipe(
        startWith(''),
        map(val => this.filterProductVendor(val.toString()))
      );
  }
  /*Get product by id*/
  private getProductDetail(id) {
    this.isLoading = true;
    const productid = Number(id);
    this.productService.getProductsById(productid).subscribe(response => {
      this.products = response;
      this.isLoading = false;
      this.bindData(this.products[0]);
    })
  }

  /*binding data in edit mode*/
  private bindData(object) {
    _.map(JSON.parse(object.colors), (value: any) => {
      let colorcode = value.ColorCode;
      let data = this.colorData.findIndex(x => x.ColorCode == colorcode)
      if (data != -1) {
        this.colorData[data].Active = true;
        this.showColorPalette = true;
      }
      else {
        this.showColorPalette = true;
        return;
      }
    });
    if (object.prices != null) {
      const prices = Utils.parse(object.prices);
      this.productForm.get('prices') as FormArray;
      new ProductSize;
      prices.forEach((p) => {
        const obj = {};
        obj["size"] = p.Size;
        obj["ProductPriceOptionId"] = p.ProductPriceOptionId,
          obj["sizeOptionId"] = p.SizeId;
        obj["costPrice"] = p.CostPrice;
        obj["regularPrice"] = p.RegularPrice;
        obj["salePrice"] = p.SalePrice;
        obj["notTaxable"] = p.NotTaxable
        let a = this.productForm.get('prices') as FormArray;
        a.push(this.createSize(obj));
      })
    }
    if (object.prices == null) {
      this.getSize();
    }
    if (object.colors != null || object.colors != '') {
      this.colors = Utils.parse(object.colors);
    }
    if (object.vendors != null) {
      this.vendors = Utils.arrayObjToString(object.vendors, 'VendorId');
    }
    this.tags = object['tags'], 'TagName';
    this.metaKeywords = object['metaKeywords'], 'TagName';
    this.images = object['images'], 'imageName';
    let attributesData = Utils.parse(object.attributes);
    let addOnsData = Utils.parse(object.addOnsProducts);
    this.productForm.patchValue({
      productId: object.productId, name: object.name, isActive: object.isActive, addOns: object.addOns, locationId: object.locationId,
      description: object.description, shortDescription: object.shortDescription, addOnsProducts: addOnsData,
      stockQuantity: object.stockQuantity, stockAvailability: object.stockAvailability,
      metaDescription: object.metaDescription, attributes: attributesData,
      vendors: this.vendors, tags: this.tags, mobileApp: object.mobileApp,
      walkIn: object.walkIn, bloomrunner: object.bloomrunner, facebook: object.facebook,
      instagram: object.instagram
    });
    if (object.facebook == true) {
      this.productForm.get('facebook').disable();
    }

    if (object.instagram == true) {
      this.productForm.get('instagram').disable();
    }
    this.productForm.value.instagram = true;
    this.productForm.value.facebook = true;

  }
  /*Getting the color codes and values for binding palette*/
  private getColorCodes() {
    this.productService.getColorCodes().subscribe(response => {
      this.colorData = response;
      this.colorData.forEach(x => {
        x.Active = false;
      });
    })
  }
  /*For adding each time a color is selected*/
  public addColors(indexObj) {
    let data = this.colors.find(x => x.ColorCode == indexObj.ColorCode)
    if (data) {
      const index: number = this.colors.indexOf(data);
      if (index !== -1) { this.colors.splice(index, 1); }
      let id = this.colorData.indexOf(data);
      this.colorData[id].Active = false;
    }
    else {
      this.colors.push(indexObj)
      let id = this.colorData.indexOf(indexObj);
      this.colorData[id].Active = true;
    }
  }

  /*For close of color palette*/
  public closePalette(): void {
    this.productForm.controls['colors'].setValue((JSON.stringify(this.colors)));
    this.showColorPalette = false;
  }
  /* Reset the whole form*/
  public reset() {
    this.productForm.reset({ images: [], tags: [], isActive: false, addOns: false, prices: this.productFB.array([]), stockQuantity: 0, vendors: [], metaKeywords: [], mobileApp: false, bloomrunner: false, walkIn: false, instagram: false, facebook: false, colors: [] });
    this.hasFormErrors = false;
    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
    this.productForm.updateValueAndValidity();
    this.productLocations = [];
  }

  /*for binding the vendors information dropdown*/
  public getVendorsData() {
    this.vendorsData = this.productService.vendorList();
  }
  /*preparing request for add product*/
  public prepareAddRequest() {
    if (this.productForm.value.attributes == null) {
      this.attributesVar = [];
    }
    else {
      this.productForm.value.attributes.forEach(element => {
        let obj = {
          attributesName: element.name ? element.name : null,
          attributesValue: element.value ? element.value : null,
          tag: element.tag ? element.tag : false
        };
        this.attributesVar.push(obj);
      });
    }

    if (this.productForm.value.addOnsProducts == null) {
      this.addOnsVar = [];
    }
    else {
      this.productForm.value.addOnsProducts.forEach(element => {
        let obj = {
          addOnsProductId: element.name ? Number(element.name) : 0,
          addOnsPrice: element.addonPrice ? Number(element.addonPrice) : 0,
        };
        this.addOnsVar.push(obj);
      });
    }

    if (this.productForm.value.prices == null) {
      this.pricesVar = [];
    }
    else {
      this.productForm.value.prices.forEach(element => {
        let obj = {
          sizeOptionId: element.sizeOptionId ? element.sizeOptionId : 0,
          costPrice: element.costPrice ? element.costPrice : 0,
          regularPrice: element.regularPrice ? element.regularPrice : 0,
          salePrice: element.salePrice ? element.salePrice : 0,
          notTaxable: element.notTaxable ? element.notTaxable : true,
        };
        this.pricesVar.push(obj);
      });
    }
    if (this.productForm.value.vendors == null) {
      this.vendorsVar = [];
    }
    else {
      this.productForm.value.vendors.forEach(element => {
        let obj = {
          vendorId: element
        };
        this.vendorsVar.push(obj);
      });
    }
    let productAdd = new ProductModel();
    productAdd = {
      floristId: this.user.floristId,
      locationId: this.user.locationId,
      name: this.productForm.value.name,
      addOns: this.productForm.value.addOns,
      isActive: this.productForm.value.isActive,
      description: this.productForm.value.description,
      shortDescription: this.productForm.value.shortDescription,
      metaDescription: this.productForm.value.metaDescription,
      metaKeywords: this.productForm.value.metaKeywords,
      tags: this.productForm.value.tags,
      images: this.productForm.value.images,
      addOnsProducts: this.addOnsVar,
      colors: this.productForm.value.colors,
      stockQuantity: this.productForm.value.stockQuantity,
      stockAvailability: this.productForm.value.stockAvailability,
      vendors: this.vendorsVar,
      mobileApp: this.productForm.value.mobileApp,
      bloomrunner: this.productForm.value.bloomrunner,
      walkIn: this.productForm.value.walkIn,
      facebook: this.productForm.value.facebook,
      instagram: this.productForm.value.instagram,
      attributes: this.attributesVar,
      prices: this.pricesVar,
      createdBy: this.user.email,
    }
    return productAdd;
  }
  /*preparing update product request*/
  public prepareUpdateRequest() {

    if (this.productForm.value.attributes == null) {
      this.attributesVar = [];
    }
    else {
      this.productForm.value.attributes.forEach(element => {
        let obj = {
          attributeId: element.id ? element.id : 0,
          attributesName: element.name ? element.name : null,
          attributesValue: element.value ? element.value : null,
          tag: element.tag ? element.tag : false
        };
        this.attributesVar.push(obj);
      });
    }

    if (this.productForm.value.addOnsProducts == null) {
      this.addOnsVar = [];
    }
    else {
      this.productForm.value.addOnsProducts.forEach(element => {
        let obj = {
          addOnId: element.addOnsProductId ? Number(element.addOnsProductId) : 0,
          addOnsProductId: element.name ? Number(element.name) : 0,
          addOnsPrice: element.addonPrice ? Number(element.addonPrice) : 0,
        };
        this.addOnsVar.push(obj);
      });
    }

    if (this.productForm.value.prices == null) {
      this.pricesVar = [];
    }
    else {
      this.productForm.value.prices.forEach(element => {
        let obj = {
          productPriceOptionId: element.ProductPriceOptionId ? element.ProductPriceOptionId : 0,
          sizeOptionId: element.sizeOptionId ? element.sizeOptionId : 0,
          costPrice: element.costPrice ? element.costPrice : 0,
          regularPrice: element.regularPrice ? element.regularPrice : 0,
          salePrice: element.salePrice ? element.salePrice : 0,
          notTaxable: element.notTaxable ? element.notTaxable : true,
        };
        this.pricesVar.push(obj);
      });
    }
    if (this.productForm.value.vendors == null) {
      this.vendorsVar = [];
    }
    else {
      this.productForm.value.vendors.forEach(element => {
        let obj = {
          vendorId: element
        };
        this.vendorsVar.push(obj);
      });
    }
    if (this.productForm.value.images == null) {
      this.imagesVar = [];
    }
    else {
      this.productForm.value.images.forEach(element => {
        let obj = {
          imageId: element.ImageId ? element.ImageId : 0,
          imageName: element.ImageName ? element.ImageName : null,
          isCoverImage: element.IsCoverImage ? element.IsCoverImage : true,
          altText: element.altText ? element.altText : null,
          imageTags: element.ImageTag ? JSON.parse(element.ImageTag) : [],
        };
        this.imagesVar.push(obj);
      });
    }
    let productUpdate = new ProductModel();
    productUpdate = {
      floristId: this.user.floristId,
      locationId: this.user.locationId,
      productId: this.productForm.value.productId,
      name: this.productForm.value.name,
      addOns: this.productForm.value.addOns,
      isActive: this.productForm.value.isActive,
      description: this.productForm.value.description,
      shortDescription: this.productForm.value.shortDescription,
      metaDescription: this.productForm.value.metaDescription,
      metaKeywords: this.productForm.value.metaKeywords,
      tags: this.productForm.value.tags,
      images: this.imagesVar,
      addOnsProducts: this.addOnsVar,
      colors: this.colors,
      stockQuantity: this.productForm.value.stockQuantity,
      stockAvailability: this.productForm.value.stockAvailability,
      vendors: this.vendorsVar,
      mobileApp: this.productForm.value.mobileApp,
      bloomrunner: this.productForm.value.bloomrunner,
      walkIn: this.productForm.value.walkIn,
      facebook: true,
      instagram: true,
      attributes: this.attributesVar,
      prices: this.pricesVar,
      modifiedBy: this.user.email,
    }
    console.log(productUpdate);
    return productUpdate;

  }
  /*on form submit function call*/
  public onSubmit() {
    const controls = this.productForm.controls;
    /** check form */
    if (this.productForm.invalid) {
      Object.keys(controls).forEach(controlName =>
        controls[controlName].markAsTouched()
      );
      this.hasFormErrors = true;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    else {
      this.hasFormErrors = false;
      this.waitingText = "Please Wait...";
      if (this.productForm.value.productId !== 0) {
        this.productService.updateProduct(this.prepareUpdateRequest()).subscribe((response) => {
          if (response.responseCode == 1) {
            this.waitingText = "Save";
            this.goBackWithoutId();
            this.snackbar.openSnackBar('Product updated successfully', 'Success', 'primary-snackbar');
          }
        });
      }
      else {
        this.productService.saveProduct(this.prepareAddRequest()).subscribe((response) => {
          if (response.responseCode == 1) {
            this.waitingText = "Save";
            this.goBackWithoutId();
            this.snackbar.openSnackBar('Product saved successfully!', 'Success', 'primary-snackbar');
          }
        });
      }
    }
  }
  /*for autocomplete searchable dropdowns*/
  public filterProductStatus(val: string): string[] {
    return AVAILABLE_STATUS.filter(option =>
      option.toLowerCase().includes(val.toLowerCase()));
  }
  //for autocomplete searchable dropdowns
  public filterProductVendor(val: string): string[] {
    return this.vendorList.filter(option =>
      option.toLowerCase().includes(val.toLowerCase()));
  }

  /*function for alert close handling*/
  public onAlertClose() {
    this.hasFormErrors = false;
  }

  /*function for choosing product color*/
  public chooseColor() {

    if (this.showColorPalette == true) {
      this.showColorPalette = false;
    }
    else {
      _.map((this.colors), (value: any) => {
        let colorcode = value.ColorCode;
        let data = this.colorData.findIndex(x => x.ColorCode == colorcode)
        if (data != -1) {
          this.colorData[data].Active = true;
          this.showColorPalette = true;
        }
        else {
          this.showColorPalette = true;
          return;
        }
      });
      this.showColorPalette = true;
    }
  }
  /*function for checking duplicate products*/
  checkDuplicate() {
    if (this.productForm.controls.name.value != null) {
      this.productService.checkProductExist(this.productForm.controls.name.value).subscribe(response => {
        if (response.responseCode == 1) {
          this.message = response.responseMessage;
          console.log(this.message);
        }
        else {
          this.message = null;
        }
      })
    }
    else {
      this.message = null;
      return false;
    }
  }
  /*handling of back button to the last activated route*/
  public goBackWithoutId() {
    this.router.navigateByUrl('/admin/products/pl', { relativeTo: this.activatedRoute });
  }
}
