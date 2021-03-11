/*Angular core modules*/
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { catchError, retry } from "rxjs/operators";
// import { isNull } from 'lodash';
import { Utils } from '../Util/Utils';
export class SharedHttpService<T> {

    public loginUserData: any;
    public userLog:any;

    public httpOptions = {
        headers: new HttpHeaders(
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            })
    }
    constructor(private url: string, private httpClient: HttpClient, private endpoint: string) {
        this.loginUserData = Utils.parse(localStorage.getItem('userPermissions'));
        this.userLog = Utils.parse(localStorage.getItem('authentication'));
    }

    get(): Observable<T[]> {
        return this.httpClient
            .get<T[]>(`${this.url}/${this.endpoint}`)
            .pipe(
                catchError(Utils.handleError)
            )
    }
    getById(id: number): Observable<T> {
        return this.httpClient
            .get<T>(`${this.url}/${this.endpoint}/${id}`)
            .pipe(
                retry(2),
                catchError(Utils.handleError)
            )
    }

    create(item: T): Observable<T> {
        return this.httpClient.post<T>(`${this.url}/${this.endpoint}`, JSON.stringify(item), this.httpOptions)
            .pipe(
                retry(2),
                catchError(Utils.handleError)
            )
    }

    update(item: T): Observable<T> {
        return this.httpClient.put<T>(`${this.url}/${this.endpoint}`, item, this.httpOptions)
            .pipe(
                retry(2),
                catchError(Utils.handleError)
            )
    }

    delete(item: T): Observable<T> {
        return this.httpClient.delete<T>(`${this.url}/${this.endpoint}/` + '?' + Utils.objectToQueryString(item), this.httpOptions)
            .pipe(
                retry(2),
                catchError(Utils.handleError)
            )
    }

    getDetailById(item): Observable<T> {        
        return this.httpClient
            .get<T>(`${this.url}/${this.endpoint}/` + '?' + Utils.objectToQueryString(item))
            .pipe(
                retry(2),
                catchError(Utils.handleError)
            )
    }

    patch(item: T): Observable<T> {          
        return this.httpClient.patch<T>(`${this.url}/${this.endpoint}`, item, this.httpOptions)
            .pipe(
                retry(2),
                catchError(Utils.handleError)
            )
    }
    get floristId() {
        if (this.loginUserData) return Number(this.loginUserData.floristId);
        return 0;
    }

    get locationId() {
        if (this.loginUserData) return Number(this.loginUserData.defultLocation);
        return 0;
    }

    get userEmail() {
        if(this.userLog.entities.user.email)return this.userLog.entities.user.email;
        return 'Admin';
    }
}