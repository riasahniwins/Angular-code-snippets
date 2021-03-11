import { Component, Input, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-gaugeseries',
  templateUrl: './gaugeseries.component.html',
  styleUrls: ['./gaugeseries.component.scss']
})
export class GaugeseriesComponent {
  /* properties and fields */
  Highcharts: typeof Highcharts = Highcharts;
  @Input() gaugeTwo: any = [];
  @Input() gaugeThree: any = [];
  @Input() name: string = '';
  @Input() chartType: string = "";
  @Input() maxAmount: number = 0;

  updateFlag = false;
  chartOptions: any = {};


  constructor() {
  }
  /* methods */
  public bindChart(seriesData, title, maxAmount) {

    if (seriesData.data.length == 0) {
      seriesData.data = [0]
    }
    Highcharts.setOptions({
      lang: {
        thousandsSep: ","
      }
    });
    this.chartOptions = {
      chart: {
        type: 'solidgauge',
        backgroundColor: 'transparent',
        width: 400,
        height:'110%'
      },

      title: {
        text: title,
        style: {
          fontSize: '24px'
        }
      },

      pane: {
        center: ['50%', '50%'],
        startAngle: -90,
        endAngle: 90,
        background: {
          backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'arc'
        }
      },

      tooltip: {
        enabled: false,
      },

      // the value axis
      yAxis: {
        stops: [
          [0.1, '#55BF3B'], // green
          [0.5, '#DDDF0D'], // yellow
          [0.9, '#DF5353'] // red
        ],
        min: 0,
        max: maxAmount,
        lineWidth: 0,
        tickWidth: 0,
        minorTickInterval: null,
        tickAmount: 2,
        title: {
          y: -70
        },
        labels: {
          y: 25,
          style: {
            fontSize: '20'
          }
        }
      },

      credits: {
        enabled: false
      },

      plotOptions: {
        solidgauge: {
          dataLabels: {
            x: -10,
            y: -10,
            borderWidth: 0,
            useHTML: true,
          }
        }
      },
      series: [seriesData]
    };
  }
  ngOnChanges(change: SimpleChanges) {

    switch (this.chartType) {
      case 'gaugeTwo': this.bindChart({
        name: 'Total Amount',
        data: change.gaugeTwo.currentValue ? [change.gaugeTwo.currentValue] : [],
        dataLabels: {
          format:
            '<div style="text-align:center">' +
            '<span style="font-size:25px">{y:,.0f}</span><br/>' +
            '<span style="font-size:12px;opacity:0.4">AED</span>' +
            '</div>'
        },
      }, 'Total Amount (AED)', change.maxAmount.currentValue ? change.maxAmount.currentValue : 0); break;
      case 'gaugeThree': this.bindChart({
        name: 'Errors',
        data: change.gaugeThree.currentValue ? [change.gaugeThree.currentValue] : [0],
        dataLabels: {
          format:
            '<div style="text-align:center">' +
            '<span style="font-size:25px">{y}</span><br/>' +
            '<span style="font-size:12px;opacity:0.4">' +
            ' <i class="fa fa-exclamation-triangle"></i>' +
            '</span>' +
            '</div>'
        },
      }, 'Errors', 10); break;
    }
    this.updateFlag = true;
  }
}
