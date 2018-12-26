import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';
var csvFilePath = require("./data/travel_time_points.csv");
type MapData = {data: any[], errors: any[], meta: any};

interface ValidState {
  data?: any[],
  time?: string,
  map?: mapboxgl.Map
}

mapboxgl.accessToken = 'pk.eyJ1IjoiY29tbXVuaXR5bG9naXEiLCJhIjoiY2luNmh3eXJ6MDBjM3ZqbHpuYm8zeGh1dyJ9.AeXQZPEAeFpj5C-1XSVN5Q';

class MainMap extends Component {
  state: ValidState
  constructor(props: any) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    let map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/communitylogiq/cjhaz2wee04bz2spq1h4ji9bw',
      center: [-122.9974365234375, 49.08353590768416],
      zoom: 10
    });
    let newPromise = (thing: mapboxgl.Map) => new Promise((resolve, reject) => {
      thing.on("style.load", function() {
        // Add the empty layer
        thing.addLayer({
          "id": "points",
          "type": "circle",
          "source": {type: "geojson", data: {type: "FeatureCollection", features: [] }},
          "paint": {
            "circle-radius": 6,
            "circle-color": "#B42222"
          }
        });
        resolve(thing);
      });
    })
    newPromise(map).then((fulfilled) => {
      this.setState({map: fulfilled})
    })

    Papa.parse(csvFilePath, {
      header: true,
      download: true,
	    complete: this.updateData.bind(this)
    })
  }

  componentDidUpdate(prevProps: any, prevState: ValidState) {
    const {time, data, map} = this.state;

    if(map !== prevProps.map && map) {
      // console.log(map)
    }
    if(prevProps.data !== data && data) {
      this.updateSource(data)
    }
    if(prevState.time !== time && map) {
      map.setFilter("points", ["==", "datetime", time]);
    }
  }

  updateSource(data: any[]) {
    const { map, time } = this.state;
    let features: GeoJSON.Feature[] = [];
    data.forEach(count => {
      features.push({
        type: 'Feature',
        properties: {
          datetime: count.datetime,
          count: count.count,
          speed: count.speed
        },
        geometry: {
          coordinates: [
            parseFloat(count.lon),
            parseFloat(count.lat)
          ],
          type: 'Point'
        }
      })
    });
    console.log(features[0])
    let geojson: GeoJSON.FeatureCollection = {type: "FeatureCollection", features: features};
    console.log(time)
    map && (map.getSource('points') as mapboxgl.GeoJSONSource).setData(geojson)
  }

  updateData(data: MapData) {
    let dataArray = data.data;
    this.setState({
      data: dataArray,
      time: dataArray[0].datetime
    })
  }

  render() {
    return (
      <div id="map"/>
    );
  }
}

export default MainMap;
