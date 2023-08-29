import { ProfileService } from './../../services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Admin } from './../../model/admin';
import { GenericValidator } from './../../shared/generic-validator';
import { Subscription, Observable, fromEvent, merge, debounceTime } from 'rxjs';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'fds-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  private _sub:Subscription | undefined;
  addProfileImage! : string;
  selectedFile: File | undefined;

  // For validations
  displayMessage: { [key: string]: string } = {};
  private _genericValidator: GenericValidator;
  private _validationMessages : { [key: string]: { [key: string]: string } };

  title:string = '';
  //tagLine:string = environment.projectTagLine;
  adminInfo:Admin | undefined | null;
  adminListForm!: FormGroup;
  editAdmin:boolean = false;
  errorMessage:string='';

  updateSuccess : boolean = false;

  constructor(private _fb : FormBuilder, private _route: ActivatedRoute, private _profileService : ProfileService, private _router : Router, private _datePipe : DatePipe ) { 
    this._validationMessages = {
      fullName : {
        required : 'Please provide full name'
      },
      password : {
        required : 'Password cannot be empty'
      },
      dish : {
        required : 'Please select the dish'
      },
      Admin :{
        required : 'Please assign the Admin'
      }
    };
    this._genericValidator = new GenericValidator(this._validationMessages);
  }

  ngOnInit(): void {
    this.errorMessage = '';
    this.initializeNewForm();
    this.addProfileImage = '../../../assets/img/add-admin.png';

    //console.log(localStorage.getItem('user'));
    this._sub = this._route.paramMap.subscribe(
      param => {
        const id:number = +param.get('id')!;
        //console.log(`id is : ${id}`);
        if(id > 0)
          this.getAdminData(id);
        else{
          this._router.navigate(['/login']);
        }
      }
    );
  }

  ngOnDestroy() : void{
    this._sub!.unsubscribe();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    // This is required because the valueChanges does not provide notification on blur
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    // so we only need to subscribe once.
    merge(this.adminListForm.valueChanges, ...controlBlurs).pipe(
      debounceTime(800)
    ).subscribe(value => {
      this.displayMessage = this._genericValidator.processMessages(this.adminListForm);
    });
  }

  initializeNewForm():void{
    this.adminListForm = this._fb.group({
      adminId : [0],
      email : ['' ,[Validators.email, Validators.required]],
      password : ['', Validators.required],
      fullName : ['', Validators.required],
      status : ['', Validators.required],
      imgUrl : [''],
      addedOn : ['', Validators.required]
    });
  }

  getAdminData(id:number){
    this._profileService.getAdminById(id).subscribe({
      next : data => {
        //console.log(`********* Admin data is : ${JSON.stringify(data)}`);
        this.adminInfo = data
        this.adminDisplay(data)
      },
      error : err => {
        this.addProfileImage = '../../../assets/img/add-admin.png';
        this.errorMessage = err.error.message;
      }
    });
  }

  adminDisplay(data:Admin){
    if(this.adminListForm){
      this.adminListForm.reset();
    }
    //this.title = `Admin Information : ${data.first_name} ${data.last_name}`;
    this.title = `Profile : ${data.fullName}`;
    this.addProfileImage = data.imgUrl!;
    //console.log(data.imgUrl);
    this.adminListForm.patchValue({
      adminId : data.adminId!,
      email : data.email,
      password : data.password,
      fullName : data.fullName,
      status : data.status,
      imgUrl : data.imgUrl,
      addedOn : this._datePipe.transform(data.addedOn, 'MMM d,y')
    });
  }

  onFormSubmit():void{
    if(this.adminListForm.valid){
      if(this.adminListForm.dirty){

        //console.log(JSON.stringify(this.adminListForm.value));
        let resData = {...this.adminInfo, ...this.adminListForm.value};
        resData.addedOn = this.adminInfo?.addedOn;
        console.log(JSON.stringify(resData));
          //this.adminListForm.value.driver.id = driver[0].id;
        
        //console.log(`-------- onFormSubmit() -> resData : ${JSON.stringify(resData)}`);
        /* let action:string = 'update';
        if(!this.adminListForm.value.id || this.adminListForm.value.id < 1){
          action = 'add';
          delete this.adminListForm.value.adminId;
        } */

        this._profileService.editAdmin(resData).subscribe({ 
          next : (data) => {
            this.adminInfo = data
            this.adminDisplay(data);
            //this.onFormSubmitComplete(data)
            this.updateSuccess = true;
          },
          error : err => {
            this.updateSuccess = false;
            this.errorMessage = err.error.message;
          }
        });
      }else{
        this.onFormSubmitComplete('Nothing has been updated');
      }
    }else{
      this.errorMessage = 'Please correct the validation errors';
    }
  }

  /* viewDriver():void{
    this._router.navigate(['/drivers',this.adminInfo?.driver.id]);
  } */

  onFormSubmitComplete(data:any){
    //console.log(JSON.stringify(data));
    this.adminListForm.reset();
    this._router.navigate(['/admin',this.adminInfo?.adminId,'profile']);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
    this._profileService.saveImage(formData)
    .subscribe({
      next : (response) => {
      // Handle successful upload response
      console.log('File uploaded successfully:', response);
      }, 
      error : (err) => {
      // Handle upload error
      console.error('File upload error:', err);
      }
    });
      
    }
  }

}
