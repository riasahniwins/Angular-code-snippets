import { Injectable } from '@angular/core';  
import { HttpClient, HttpEventType } from  '@angular/common/http';
import { map } from  'rxjs/operators';
  
@Injectable({  
  providedIn: 'root'  
})  
export class UploadService { 
  uploadUrl: string = "http://localhost:3000";
  constructor(private httpClient: HttpClient) { } 

  public upload(data, userId) {    
    let uploadURL = `${this.uploadUrl}/auth/${userId}/avatar`;
    return this.httpClient.post<any>(uploadURL, data, {
      reportProgress: true,
      observe: 'events'
    }).pipe(map((event) => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          const progress = Math.round(100 * event.loaded / event.total);
          return { status: 'progress', message: progress };

        case HttpEventType.Response:
          return event.body;
        default:
          return `Unhandled event: ${event.type}`;
      }
    })
    );
  }
}  