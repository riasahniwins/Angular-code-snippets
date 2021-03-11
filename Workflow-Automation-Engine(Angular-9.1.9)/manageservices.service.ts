/*** Angular core modules ***/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/*** Rxjs ***/
import { Observable, Subject } from 'rxjs';

/*** Models ***/
import { environment } from 'src/environments/environment';
import { SharedHttpService } from 'src/app/Shared/Services/http.Services';
import { NzNotificationService } from 'ng-zorro-antd';
import { NotificationMessageModel } from 'src/app/Shared/Model/NotificationMessage.Model';

@Injectable()
export class ManageServicesService {
    /// Global variables
    private APIUrl: string = environment.apiGateway;
    public httpOptions = {};
    private notificationModel = new NotificationMessageModel();
    private httpObj: any;
    public sendFlags: Subject<any> = new Subject<any>();



    constructor(private httpClient: HttpClient, private notification: NzNotificationService) {

        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'languageId': localStorage.getItem('selectedLanguage') != null ? JSON.parse(localStorage.getItem('selectedLanguage')).id.toString() : 1
            })
        }
    }
    public Get(endPoint: string): Observable<any> {
        this.httpObj = new SharedHttpService(this.APIUrl, this.httpClient, endPoint);
        return this.httpObj.get();
    }
    public GetById(endPoint: string, requestParams: any): Observable<any> {
        this.httpObj = new SharedHttpService(this.APIUrl, this.httpClient, endPoint);
        return this.httpObj.getByParams(requestParams);
    }
    public Add(endPoint: string, requestParams: any): Observable<any> {
        this.httpObj = new SharedHttpService(this.APIUrl, this.httpClient, endPoint);
        return this.httpObj.create(requestParams);
    }
    public Update(endPoint: string, requestParams: any): Observable<any> {

        this.httpObj = new SharedHttpService(this.APIUrl, this.httpClient, endPoint);
        return this.httpObj.update(requestParams);
    }
    public Delete(endPoint: string, requestParams: any): Observable<any> {
        this.httpObj = new SharedHttpService(this.APIUrl, this.httpClient, endPoint);
        return this.httpObj.delete(requestParams);
    }
    public reOrder(endPoint: string, requestParams: any): Observable<any> {
        this.httpObj = new SharedHttpService(this.APIUrl, this.httpClient, endPoint);
        return this.httpObj.updateQuery(requestParams);
    }
    public notify(type, title, message) {
        this.notification.create(
            type,
            title,
            message
        );
    }

}