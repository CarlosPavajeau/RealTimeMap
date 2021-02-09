import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from "@angular/google-maps";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { EmployeeLocation } from "../../models/employee-location";
import { RealTimeMapService } from "../../services/real-time-map.service";

@Component({
  selector: 'app-real-time-map',
  templateUrl: './real-time-map.component.html',
  styleUrls: [ './real-time-map.component.css' ]
})
export class RealTimeMapComponent implements OnInit, OnDestroy {
  apiLoaded: Observable<boolean>;
  id: string;

  options: google.maps.MapOptions = {
    center: { lat: 40, lng: -20 },
    zoom: 40
  };

  position: google.maps.LatLngLiteral = {
    lat: 40,
    lng: -10
  };

  markerOptions: google.maps.MarkerOptions = {
    icon: {
      url: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.hAXyuGkJIUT7hs3isWty5gHaHa%26pid%3DApi&f=1',
      size: new google.maps.Size(15, 15),
      scaledSize: new google.maps.Size(15, 15),
    },
    title: 'Hello',
    label: 'Hello there!'
  };

  markers: google.maps.Marker[] = [];

  g_map: GoogleMap;

  interval;

  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  constructor(private httpClient: HttpClient, private realTimeService: RealTimeMapService) {
  }

  ngOnInit(): void {
    this.realTimeService.startConnection();
    this.realTimeService.addOnUpdateEmployeeLocationListener();

    this.id = (Math.random() * 20000 + 1000).toString();

    this.realTimeService.onUpdateEmployeeLocation.subscribe((employeeLocation: EmployeeLocation) => {
      this.updateEmployeeLocation(employeeLocation);
    });

    this.loadGoogleMapsApi();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setCurrentPosition);
    }

    this.interval = setInterval(this.sendMyLocation, 10000);
  }

  private setCurrentPosition(position: Position) {
    if (position) {
      const employeeLocation: EmployeeLocation = {
        id: this.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      this.realTimeService.sendNewEmployeeLocation(employeeLocation);

      this.options = {
        center: { lat: position.coords.latitude, lng: position.coords.longitude },
        zoom: 15
      };
      this.markers.push(new google.maps.Marker({
        position: this.options.center, label: {
          text: employeeLocation.id,
        },
        title: employeeLocation.id
      }));
      this.position = { lat: position.coords.latitude + .01, lng: position.coords.longitude - .02 };
      console.log(position);
    }
  }

  private sendMyLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        if (position) {
          const employeeLocation: EmployeeLocation = {
            id: this.id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          this.realTimeService.sendNewEmployeeLocation(employeeLocation);
        }
      });
    }
  }

  private loadGoogleMapsApi() {
    this.apiLoaded = this.httpClient.jsonp(`https://maps.googleapis.com/maps/api/js?key=${ environment.google_maps_api_key }`, 'callback')
      .pipe(
        map(() => true),
        catchError((err) => {
          console.error(err);
          return of(false);
        }),
      );
  }

  private updateEmployeeLocation(employeeLocation: EmployeeLocation) {
    if (navigator.geolocation) {
      console.log('New location receive for id ' + employeeLocation.id);
      console.log(employeeLocation);

      const markerIndex = this.markers.findIndex((marker) => {
        return marker.getLabel().text == employeeLocation.id;
      });

      if (markerIndex != -1) {
        this.markers[markerIndex].setPosition({ lat: employeeLocation.latitude, lng: employeeLocation.longitude });
      } else {
        this.markers.push(new google.maps.Marker({
          position: {
            lat: employeeLocation.latitude,
            lng: employeeLocation.longitude
          },
          label: {
            text: employeeLocation.id
          },
          title: employeeLocation.id,
        }));
      }
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  openInfoWindow(marker: MapMarker, infoWindow: MapInfoWindow): void {
    infoWindow.open(marker);
  }
}
