import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate',
  pure: true
})
export class TranslatePipe implements PipeTransform {

  transform(value: any, change?: any): string {
    if(!value){ return "";}
    if(value){         
      let languageId = JSON.parse(localStorage.getItem('selectedLanguage')).id;   
      if(typeof(value) == "string"){
        value = JSON.parse(value);      }         
      const current = value.find(
        (field) => field.langId === languageId
      );      
      return  current.value;
    }
  }

}
