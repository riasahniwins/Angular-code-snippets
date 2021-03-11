import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'activity-gauge',
  templateUrl: './ActivityGauge.Component.html',
  styleUrls: ['./ActivityGauge.Component.scss']
})
export class ActivityGaugeComponent implements OnChanges {
  /* properties and fields */
  Highcharts: typeof Highcharts = Highcharts;
  @Input() success: any = [];
  @Input() failed: any = [];
  @Input() pending: any = [];
  updateFlag = false;
  chartOptions: any = {};

  constructor() {

  }

  /* methods */
  public bindChart(seriesData) {
    Highcharts.setOptions({
      lang: {
        thousandsSep: ","
      }
    });
    this.chartOptions = {
      chart: {
        type: 'solidgauge',
        width:350
      },
      colors: ['#F62366', '#9DFF02', '#0CCDD6'],
      title: {
        text: "Today's Transactions Count",
        style: {
          fontSize: '20px',
        }
      },
      tooltip: {
        borderWidth: 0,
        backgroundColor: 'none',
        shadow: false,
        style: {
          fontSize: '12px',
          color: 'silver'
        },
        pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.label}</span>',
        positioner: function (labelWidth) {
          return {
            x: (this.chart.chartWidth - labelWidth) / 2,
            y: (this.chart.plotHeight / 2) + 15
          };
        }
      },
      pane: {
        startAngle: 0,
        endAngle: 360,
        background: [{ // Track for Move
          outerRadius: '100%',
          innerRadius: '60%',
          backgroundColor: Highcharts.color(Highcharts.getOptions().colors[0])
            .setOpacity(0.3)
            .get(),
          borderWidth: 0
        }, { // Track for Exercise
          outerRadius: '80%',
          innerRadius: '30%',
          backgroundColor: Highcharts.color(Highcharts.getOptions().colors[1])
            .setOpacity(0.3)
            .get(),
          borderWidth: 0
        }, { // Track for Stand
          outerRadius: '62%',
          innerRadius: '38%',
          backgroundColor: Highcharts.color(Highcharts.getOptions().colors[2])
            .setOpacity(0.3)
            .get(),
          borderWidth: 0
        }]
      },

      yAxis: {
        min: 0,
        max: 100,
        lineWidth: 0,
        tickPositions: []
      },

      plotOptions: {
        solidgauge: {
          dataLabels: {
            enabled: false,
          },
          linecap: 'round',
          stickyTracking: false,
          rounded: true,

        },

      },

      series: seriesData
    }
  }
  ngOnChanges(change: SimpleChanges) {
    this.bindChart([
      {
        name: change.pending ? 'Pending' : null,
        data: [{
          color: Highcharts.getOptions().colors[3],
          radius: '87%',
          innerRadius: '63%',
          y: parseFloat(parseFloat(((change.pending.currentValue + 10) / (10 + change.success.currentValue + change.pending.currentValue + change.failed.currentValue) * 100).toString()).toFixed(2)),
          label: change.pending.currentValue
        }]
      },
      {
        name: change.failed ? 'Failed' : null,
        data: [{
          color: Highcharts.getOptions().colors[1],
          radius: '62%',
          innerRadius: '38%',
          y: parseFloat(parseFloat(((change.failed.currentValue + 10) / (10 + change.success.currentValue + change.pending.currentValue + change.failed.currentValue) * 100).toString()).toFixed(2)),
          label: change.failed.currentValue
        }]
      },
      {
        name: change.success ? 'Successful' : null,
        data: [{
          color: Highcharts.getOptions().colors[2],
          radius: '112%',
          innerRadius: '88%',
          y: parseFloat(parseFloat(((change.success.currentValue + 10) / (10 + change.success.currentValue + change.pending.currentValue + change.failed.currentValue) * 100).toString()).toFixed(2)),
          label: change.success.currentValue
        }],
      },
    ]);
    this.updateFlag = true;
  }
}
