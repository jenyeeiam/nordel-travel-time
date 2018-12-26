import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Map from './Map';
import moment from 'moment';
import {Moment} from 'moment';

interface ValidState {
  time?: Moment,
  times?: string[]
}

class App extends Component {
  state: ValidState
  constructor(props: any) {
    super(props);
    this.state = {}
  }

  handleTimeSlider(value: number) {
    if(this.state.times) {
      this.setState({time: moment(this.state.times[value])})

    }
  }

  handleSetTime(time: string, times: string[]) {
    this.setState({time: moment(time), times})
  }

  render() {
    return (
      <div className="App">
        <Map
          setTimes={this.handleSetTime.bind(this)}
          time={moment(this.state.time).format('YYYY-MM-DD HH:mm:ss')}
        />
        <div
          className='clock'
          onClick={() => {
            let t0 = 10000;
            setInterval(() => {
              t0 += 5;
              this.handleTimeSlider(t0)
            }, 250)
          }}
        >{moment(this.state.time).format('HH:mm:ss') || ''}</div>

      </div>
    );
  }
}

export default App;
