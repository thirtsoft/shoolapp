import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  public setItem(key: string, data: any): void {
    localStorage.setItem(key, data);
  }

  public setObject(key: string, data: any): void {
     localStorage.setItem(key, JSON.stringify(data));
  }

  public getObject(key: string): any {
    return  JSON.parse(localStorage.getItem(key)!);
  }

  public getItem(key: string): any {
    return  localStorage.getItem(key);
  }

  public removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  public clear() {
    localStorage.clear();
  }
}
