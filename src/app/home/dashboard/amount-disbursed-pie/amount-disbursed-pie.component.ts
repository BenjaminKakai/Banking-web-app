import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HomeService } from '../../home.service';
import Chart from 'chart.js';

@Component({
  selector: 'mifosx-amount-disbursed-pie',
  templateUrl: './amount-disbursed-pie.component.html',
  styleUrls: ['./amount-disbursed-pie.component.scss']
})
export class AmountDisbursedPieComponent implements OnInit {
  officeId = new UntypedFormControl();
  officeData: any;
  chart: any;
  hideOutput = true;
  showFallback = true;

  constructor(
    private homeService: HomeService,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.getChartData();
    this.officeId.patchValue(1);
  }

  getChartData() {
    this.officeId.valueChanges.subscribe((value: number) => {
      this.homeService.getDisbursedAmount(value).subscribe((response: any) => {
        console.log('Disbursed Amount Full Response:', response);
        console.log('Response type:', typeof response);
        if (Array.isArray(response)) {
          console.log('First element:', response[0]);
          console.log('First element type:', typeof response[0]);
        }

        if (!response || response.length === 0) {
          this.showFallback = true;
          this.hideOutput = true;
          return;
        }

        const data = response;

        if (!(data[0] === 0 && data[1] === 0)) {
          this.setChart(data);
          this.showFallback = false;
          this.hideOutput = false;
        } else {
          this.showFallback = true;
          this.hideOutput = true;
        }
      });
    });
  }

  setChart(data: any) {
    if (!this.chart) {
      this.chart = new Chart('disbursement-pie', {
        type: 'doughnut',
        data: {
          labels: ['Pending', 'Disbursed'],
          datasets: [{
            backgroundColor: ['dodgerblue', 'red'],
            data: data
          }]
        },
        options: {
          layout: {
            padding: {
              top: 10,
              bottom: 15
            }
          }
        }
      });
    } else {
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }
}