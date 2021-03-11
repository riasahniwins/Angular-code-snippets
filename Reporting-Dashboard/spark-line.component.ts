/* angular core modules and components */
import { Component, Input, SimpleChanges, OnChanges } from "@angular/core";
import * as Highcharts from 'highcharts';
import { Options } from "highcharts";

@Component({
  selector: "app-spark-line",
  templateUrl: "./spark-line.component.html",
  styleUrls: ["./spark-line.component.scss"]
})

export class SparkLineComponent implements OnChanges {

  /* properties and fields */
  Highcharts: typeof Highcharts = Highcharts;
  @Input() data: Array<number>;
  @Input() name: string;
  @Input() chartType: string = "";
  updateFlag = false;
  constructor() {
    Highcharts.setOptions({
      lang: {
        thousandsSep: ","
      }
    });
  }
  /* methods */
  public chartOptions: Options = {
    chart: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      type: this.chartType,
      margin: [2, 0, 2, 0],
      width: 120,
      height: 20,
      style: {
        overflow: "visible"
      }
    },
    title: { text: "" },
    credits: { enabled: false },
    xAxis: {
      type: 'datetime',
      //step: 24,
      tickInterval: 3600 * 1000,
      labels: {
        enabled: false
      },
      title: {
        text: null
      },
      startOnTick: false,
      endOnTick: false,
      tickPositions: []
    },
    yAxis: {
      endOnTick: false,
      startOnTick: false,
      labels: {
        enabled: false
      },
      title: {
        text: null
      },
      tickPositions: [0]
    },
    legend: {
      enabled: false
    },
  
    tooltip: {
      borderWidth: 0,
      hideDelay: 0,
      shadow: false,
      outside: true,
      shared: true,
      followPointer:false,
      followTouchMove :false,
      animation: false,
      formatter() {
        const series = this.points[0].series;
        return ` ${series.name}, Time:${Highcharts.dateFormat('%I:%M %p', this.x)}<br/>
          <br>
          <b>Value:${this.y}</b>
          `
      },
    },

    plotOptions: {
      line: {
        findNearestPointBy: 'xy', //or "xy" to both axis 
        marker: {
          enabled: true
        }
      },
      series: {
        stickyTracking: false,
        animation: false,
        shadow: false,
        pointStart: Date.UTC(20120, 12, 1),
        pointInterval: 3600 * 1000,
      },
      column: {
        negativeColor: "#910000",
        borderColor: "silver",
        colorByPoint: true
      },
    },
    series: [
      {
        name: '',
        type: 'area',
        data: [],
        stickyTracking: false,
        lineWidth: 2,
      },

    ]
  };

  ngOnChanges(change: SimpleChanges) {
    this.chartOptions.series = [{
      name: change.name ? change.name.currentValue : null,
      type: this.chartType === 'area' ? 'area' : 'column',
      data: change.data.currentValue,
    }];
    this.updateFlag = true;
  }
}



