import React, {  Component } from 'react';
import { View, Text, PermissionsAndroid, StyleSheet, TouchableOpacity} from 'react-native';
import Boundary, {Events} from 'react-native-boundary';
import Geolocation from '@react-native-community/geolocation';
import { getGeofence } from './API/apigeo';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import BackgroundFetch from "react-native-background-fetch";

navigator.geolocation = require('@react-native-community/geolocation');

export default class App extends React.Component {

  componentWillMount (){
    this.state = {
      lat: 0,
      lng: 0,
      idgeofence: "",
      backgroundColor: "#272ADD",
  }

  async function requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
          'title': 'Location permission',
          'message': 'Needed obviously'
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Granted Permission")
      //  navigator.geolocation.setRNConfiguration(config); 
      } else {
        console.log("Denied Permission")
      }
    } catch (err) {
      console.warn(err)
    }
  }

  if (Platform.OS === 'android') {
    requestLocationPermission();
  }

  Boundary.removeAll();


  var getPosition = function (options) {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.watchPosition(resolve, reject,
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
      {useSignificantChanges: true});
    });
  }

  getPosition()
    .then((position) => {
      Boundary.removeAll();
      getGeofence(position.coords.latitude,position.coords.longitude).then(data => {
        data.datas.forEach( function (element) {
          Boundary.add({
            lat: element.lat,
            lng: element.lng,
            radius: 200, // in meters
            id: element.id,
          }).then(() => console.log(element.id + " ADD GLOBAL"))
          .catch(e => console.error("error :(", e));}
          )
      });
    })
    .catch((err) => {
      console.error(err.message);
    })    

  // EVENT ENTRER
  Boundary.on(Events.ENTER, id => {
    // Prints 'Get out of my Chipotle!!'
    this.setState({ backgroundColor: "#27DD2A" , idgeofence: this.state.idgeofence + " " + id});

    console.log(`On est dans le ${id}!!`);

    navigator.geolocation.getCurrentPosition(
      (position) => {
       console.log(position);
       DeviceInfo.getBatteryLevel().then(batteryLevel => {     
        console.log("----------------INSERT IN -------------------");
        console.log(id);
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
        console.log(DeviceInfo.getUniqueId());
        console.log(DeviceInfo.getModel());
        console.log(batteryLevel);
        console.log(new Date().toISOString().slice(0, 19).replace('T', ' '));
    
        id.forEach( function (element) {
          fetch('https://fr-preprod.caravel-app.ovh/api/v1/geofences/setListener', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "id_geofence": element,
              "type": "in",
              "lat": position.coords.latitude,
              "lng": position.coords.longitude,
              "uid": DeviceInfo.getUniqueId(),
              "os": DeviceInfo.getModel(),
              "battery":  batteryLevel,
              "time": new Date().toISOString().slice(0, 19).replace('T', ' '),
            })
          }).then((response) => response.json())
          .catch((error) => console.error(error));
        });
    
        });
      },
      (err) => console.log(err),
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 3000}
    );        
  });
  
  // EVENT SORTIE
  Boundary.on(Events.EXIT, id => {
    this.setState({ backgroundColor: "#DD2727" });
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
       console.log(position);
       DeviceInfo.getBatteryLevel().then(batteryLevel => {     
        console.log("----------------INSERT OUT -------------------");
        console.log(id);
        console.log(position.coords.latitude);
        console.log(position.coords.longitude);
        console.log(DeviceInfo.getUniqueId());
        console.log(DeviceInfo.getModel());
        console.log(batteryLevel);
        console.log(new Date().toISOString().slice(0, 19).replace('T', ' '));
    
        id.forEach( function (element) {
          fetch('https://fr-preprod.caravel-app.ovh/api/v1/geofences/setListener', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "id_geofence": element,
              "type": "out",
              "lat": position.coords.latitude,
              "lng": position.coords.longitude,
              "uid": DeviceInfo.getUniqueId(),
              "os": DeviceInfo.getModel(),
              "battery":  batteryLevel,
              "time": new Date().toISOString().slice(0, 19).replace('T', ' '),
            })
          }).then((response) => response.json())
          .catch((error) => console.error(error));
        });
    
        });
      },
      (err) => console.log(err),
      {enableHighAccuracy: true, timeout: 10000, maximumAge: 3000}
    );
  });
}


 componentDidMount() {

    //see above
   

    /*

    BackgroundFetch.configure({
      minimumFetchInterval: 15,     // <-- minutes (15 is minimum allowed)
      // Android options
      stopOnTerminate: false,
      startOnBoot: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Default
      requiresCharging: false,      // Default
      requiresDeviceIdle: false,    // Default
      requiresBatteryNotLow: false, // Default
      requiresStorageNotLow: false,
      enableHeadless: true  // Default
    }, () => {
      console.log("[js] Received background-fetch event");
      // Required: Signal completion of your task to native code
      // If you fail to do this, the OS can terminate your app
      // or assign battery-blame for consuming too much background-time
      BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
    }, (error) => {
      console.log("[js] RNBackgroundFetch failed to start");
    });
*/
  
  }

  componentWillUnmount() {
  }

  

render() {
    return (
      <View style={styles.container , {backgroundColor: this.state.backgroundColor}}>
        <TouchableOpacity >
          <Text style={styles.welcome}>{this.state.idgeofence}</Text>
        </TouchableOpacity>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
