import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';
import {uniq} from 'lodash';
var csvFilePath = require("./data/travel_time_points.csv");
type MapData = {data: any[], errors: any[], meta: any};

interface ValidState {
  data?: any[],
  time?: string,
  map?: mapboxgl.Map
}

mapboxgl.accessToken = 'pk.eyJ1IjoiY29tbXVuaXR5bG9naXEiLCJhIjoiY2luNmh3eXJ6MDBjM3ZqbHpuYm8zeGh1dyJ9.AeXQZPEAeFpj5C-1XSVN5Q';

class MainMap extends Component<any, any> {
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
      center: [-122.913555, 49.162057],
      zoom: 13
    });
    let newPromise = (thing: mapboxgl.Map) => new Promise((resolve, reject) => {
      thing.on("style.load", function() {
        // Add the empty layer
        thing.addLayer({
          "id": "points",
          "type": "circle",
          "source": {type: "geojson", data: {type: "FeatureCollection", features: [] }},
          "paint": {
            "circle-radius": [
              'interpolate',
              ['linear'],
              ['get', 'count'],
              1, 3,
              10, 10
            ],
            "circle-color": [
              'case',
              ['==', ['get', 'direction'], 'WB'],
              '#FCA107',
              '#7F3121'
            ]
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
    const {data, map} = this.state;

    if(prevProps.time !== this.props.time && map) {
      map.setFilter("points", ["==", "datetime", this.props.time]);
    }
  }

  updateSource(data: any[]) {
    const { map } = this.state;
    let features: GeoJSON.Feature[] = [];
    data.forEach(count => {
      features.push({
        type: 'Feature',
        properties: {
          datetime: count.datetime,
          count: Number(count.count),
          speed: Number(count.speed),
          direction: count.direction
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
    let geojson: GeoJSON.FeatureCollection = {type: "FeatureCollection", features: features};
    map && (map.getSource('points') as mapboxgl.GeoJSONSource).setData(geojson)
  }

  updateData(data: MapData) {
    let times = uniq(data.data.map(d => d.datetime));
    this.updateSource(data.data);
    this.props.setTimes(data.data[0].datetime, times)
  }

  render() {
    return (
      <div id="map"/>
    );
  }
}

export default MainMap;
