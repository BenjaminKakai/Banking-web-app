import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, merge } from 'rxjs';
import { skip } from 'rxjs/operators';
import { HomeService } from '../../home.service';
import { Dates } from 'app/core/utils/dates';
import Chart from 'chart.js';

@Component({
  selector: 'mifosx-client-trends-bar',
  templateUrl: './client-trends-bar.component.html',
  styleUrls: ['./client-trends-bar.component.scss']
})
export class ClientTrendsBarComponent implements OnInit {
  officeId = new UntypedFormControl();
  timescale = new UntypedFormControl();
  officeData: any;
  chart: any;
  hideOutput = true;

  constructor(
    private homeService: HomeService,
    private route: ActivatedRoute,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.getChartData();
    this.initializeControls();
  }

  initializeControls() {
    this.officeId.patchValue(1);
    this.timescale.patchValue('Day');
  }

  getChartData() {
    merge(this.officeId.valueChanges, this.timescale.valueChanges)
      .pipe(skip(1))
      .subscribe(() => {
        const officeId = this.officeId.value;
        const timescale = this.timescale.value;
        switch (timescale) {
          case 'Day':
            const clientsByDay = this.homeService.getClientTrendsByDay(officeId);
            const loansByDay = this.homeService.getLoanTrendsByDay(officeId);
            forkJoin([clientsByDay, loansByDay]).subscribe((data: any[]) => {
              console.log('Day Data:', data);
              const dayLabels = this.getLabels(timescale);
              const clientCounts = this.getCountsFromReport(data[0], dayLabels, timescale, 'client');
              const loanCounts = this.getCountsFromReport(data[1], dayLabels, timescale, 'loan');
              this.setChart(dayLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          case 'Week':
            const clientsByWeek = this.homeService.getClientTrendsByWeek(officeId);
            const loansByWeek = this.homeService.getLoanTrendsByWeek(officeId);
            forkJoin([clientsByWeek, loansByWeek]).subscribe((data: any[]) => {
              console.log('Week Data:', data);
              const weekLabels = this.getLabels(timescale);
              const clientCounts = this.getCountsFromReport(data[0], weekLabels, timescale, 'client');
              const loanCounts = this.getCountsFromReport(data[1], weekLabels, timescale, 'loan');
              this.setChart(weekLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
          case 'Month':
            const clientsByMonth = this.homeService.getClientTrendsByMonth(officeId);
            const loansByMonth = this.homeService.getLoanTrendsByMonth(officeId);
            forkJoin([clientsByMonth, loansByMonth]).subscribe((data: any[]) => {
              console.log('Month Data:', data);
              const monthLabels = this.getLabels(timescale);
              const clientCounts = this.getCountsFromReport(data[0], monthLabels, timescale, 'client');
              const loanCounts = this.getCountsFromReport(data[1], monthLabels, timescale, 'loan');
              this.setChart(monthLabels, clientCounts, loanCounts);
              this.hideOutput = false;
            });
            break;
        }
      });
  }

  getLabels(timescale: string) {
    const date = new Date();
    const labelsArray = [];
    switch (timescale) {
      case 'Day':
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 1);
          const transformedDate = this.dateUtils.formatDate(date, 'd/M');
          labelsArray.push(transformedDate);
        }
        break;
      case 'Week':
        const onejan = new Date(date.getFullYear(), 0, 1);
        while (labelsArray.length < 12) {
          date.setDate(date.getDate() - 7);
          const weekNumber = Math.ceil(
            (((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7
          );
          labelsArray.push(weekNumber);
        }
        break;
      case 'Month':
        while (labelsArray.length < 12) {
          const transformedDate = this.dateUtils.formatDate(date, 'MMMM');
          labelsArray.push(transformedDate);
          date.setMonth(date.getMonth() - 1);
        }
        break;
    }
    return labelsArray.reverse();
  }

  getCountsFromReport(response: any, labels: any[], timescale: string, type: string) {
    let counts: number[] = [];
    
    // Handle the new report response format
    if (!response || !response.data) {
      return new Array(labels.length).fill(0);
    }

    const reportData = response.data;
    
    switch (timescale) {
      case 'Day':
        labels.forEach((label: any) => {
          const day = reportData.find((entry: any) => {
            const dateField = type === 'client' ? entry[0] : entry[0]; // Adjust index based on your report columns
            const transformedDate = this.dateUtils.formatDate(new Date(dateField), 'd/M');
            return transformedDate === label;
          });
          counts = this.updateCountFromReport(day, counts, type);
        });
        break;
      case 'Week':
        labels.forEach((label: any) => {
          const week = reportData.find((entry: any) => {
            const weekField = type === 'client' ? entry[1] : entry[1]; // Adjust index based on your report columns
            return parseInt(weekField) === label;
          });
          counts = this.updateCountFromReport(week, counts, type);
        });
        break;
      case 'Month':
        labels.forEach((label: any) => {
          const month = reportData.find((entry: any) => {
            const monthField = type === 'client' ? entry[2] : entry[2]; // Adjust index based on your report columns
            return monthField === label;
          });
          counts = this.updateCountFromReport(month, counts, type);
        });
        break;
    }
    return counts;
  }

  updateCountFromReport(entry: any[], counts: number[], type: string) {
    if (entry) {
      const countIndex = type === 'client' ? 3 : 3; // Adjust index based on your report columns
      counts.push(parseInt(entry[countIndex]) || 0);
    } else {
      counts.push(0);
    }
    return counts;
  }

  setChart(labels: any[], clientCounts: number[], loanCounts: number[]) {
    if (!this.chart) {
      this.chart = new Chart('client-trends-bar', {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'New Clients',
              data: clientCounts,
              backgroundColor: 'dodgerblue',
              borderColor: 'dodgerblue',
              borderWidth: 2,
              fill: false
            },
            {
              label: 'Loans Disbursed',
              data: loanCounts,
              backgroundColor: 'red',
              borderColor: 'red',
              borderWidth: 2,
              fill: false,
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              scaleLabel: {
                display: true,
                labelString: 'Values',
                fontColor: '#1074B9'
              }
            },
          }
        }
      });
    } else {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = clientCounts;
      this.chart.data.datasets[1].data = loanCounts;
      this.chart.update();
    }
  }
}