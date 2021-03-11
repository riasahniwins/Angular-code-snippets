import { of } from "rxjs";
import { find } from 'lodash';

export class Utils {
    /*Handel Error Message*/
    static handleError(error: any) {
        let message = 'Internal Server error.';
        if (error) {
            if (error.status === 404) {
                message = 'Backend Server not respond';
            }
            if (error.status === 401) {
                message = 'User is not authenticated';
            } else {
                if (error.status === 0 && !error.statusText) {
                    message = 'Internal server error';
                } else {
                    message = (error.message) ? error.message : (error.status) ? `${error.status} - ${error.statusText}` : message;
                }
            }
        }
        if (message === 'Read timed out') {
            message = 'Read timed out';
        }
        return of(error);
    }

    /*Read query string and push to object*/
    static objectToQueryString(obj: any): string {
        let str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    /*Return array obect key value to string array*/
    static arrayObjToString(object, key) {
        if (typeof (object) === "object") {
            return object.map(function (obj) { return obj[key] });
        }
        else {
            return JSON.parse(object).map(function (obj) { return obj[key] });
        }
    }

    /*Return array obect key value to string array*/
    static stringToArrayObj(object, key) {
        if (typeof (object) === "object") {
            return object.map(function (obj) { return { [key]: obj } });
        }
    }
    /*Return object key value to number type*/
    static strNum(object, key) {
        return JSON.parse(object).map(function (obj) { return parseInt(obj[key]) });
    }

    static find(arr: any, key: string, val: any) {
        return find(arr, function (i) { return i[key] == val; });
    }
    static returnKeyValue(array: any, key: string) {
        return array.map(array => array[key]); // [12, 14, 16, 18]
    }

    static IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    static parse(str) {
        if (str && typeof (str) === "string") {
            try{
                return JSON.parse(str);
            }
            catch(e){
                return 0;
            }
        }
        else {
            return str;
        }
    }

}
