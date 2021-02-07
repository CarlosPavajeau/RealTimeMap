import { EventEmitter, Injectable, Output } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { EmployeeLocation } from "../models/employee-location";


@Injectable({
  providedIn: 'root'
})
export class RealTimeMapService {

  private hubConnection: signalR.HubConnection;

  @Output('onUpdateEmployeeLocation')
  public onUpdateEmployeeLocation: EventEmitter<EmployeeLocation> = new EventEmitter<EmployeeLocation>();

  constructor() { }

  public startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder().withUrl('/RealTimeMap').build();

    this.hubConnection.start()
      .then(() => console.log('Connection started'))
      .catch((err) => {
      console.log('Error while starting connection: ' + err);
      this.startConnection();
    });
  }

  public addOnUpdateEmployeeLocationListener(): void {
    this.hubConnection.on('UpdateEmployeeLocation', (employeeLocation: EmployeeLocation) => {
      this.onUpdateEmployeeLocation.emit(employeeLocation);
    })
  }

  public sendNewEmployeeLocation(employeeLocation: EmployeeLocation): void {
    this.hubConnection.invoke('NewEmployeeLocation', employeeLocation)
      .then(() => {
      console.log('New location send for id: ' + employeeLocation.id);
    })
      .catch(err => {
        console.log('Error while sending new employee location: ' + err);
      })
  }
}
