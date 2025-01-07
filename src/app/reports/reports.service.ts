/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Custom Models */
import { ReportParameter } from './common-models/report-parameter.model';
import { SelectOption } from './common-models/select-option.model';
import { ChartData } from './common-models/chart-data.model';

/**
 * Reports service.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * @returns {Observable<any>} Reports data
   */
  getReports(): Observable<any> {

    // Updated this endpoint
    return this.http.get(`${environment.serverUrl}/reports`);
    //return this.http.get('/reports');
  }

  /**
   * @returns {Observable<any>} Mix Taxonomy data
   */
  getMixTaxonomyArray(): Observable<any> {
    return this.http.get('/mixtaxonomy');
  }

  /**
   * @returns {Observable<any>} Mix Taxonomy data
   */
  getMixMappings(): Observable<any> {
    return this.http.get('/mixmapping');
  }

  /**
   * @param {any} mixMappingData Mix Mapping data to be posted
   * @returns {Observable<any>} response code
   */
  editMixMappings(mixMappingData: any): Observable<any> {
    return this.http.put('/mixmapping', mixMappingData);
  }

  /**
   * @param {any} dates start date and end date
   * @returns {Observable<any>} Mix Report
   */
  getMixReport(dates: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('startDate', dates.startDate)
      .set('endDate', dates.endDate);
    return this.http.get('/mixreport', { params: httpParams, responseType: 'text' });
  }

  /**
   * @param {string} reportName Report name for which parameters are needed.
   * @returns {Observable<ReportParameter[]>}
   */

//New update to the report api route too. Initiall route commented below
getReportParams(reportName: string): Observable<ReportParameter[]> {
  // Map of report names to their IDs
  const reportIds: { [key: string]: number } = {
    'Trial Balance Table': 29,
    'GeneralLedgerReport Table': 30,
    'Income Statement Table': 31,
    'Balance Sheet Table': 32,
    'Trial Balance Summary Report': 33,
    'Transaction Summary Report': 34,
    'Trial Balance Summary Report with Asset Owner': 35,
    'Transaction Summary Report with Asset Owner': 36,
    'Demand-Vs-Collection': 37,
    'Disbursal Vs Awaitingdisbursal': 38,

};

  const reportId = reportIds[reportName];
  
  const httpParams = new HttpParams()
    .set('fromDate', '2024-01-01')
    .set('toDate', '2024-12-31');
    
  return this.http.get(`${environment.serverUrl}/reports/${reportId}`, {params: httpParams})
    .pipe(map((response: any) => response.data));
}


  //getReportParams(reportName: string): Observable<ReportParameter[]> {
  //  const httpParams = new HttpParams()
   //   .set('R_reportListing', `'${reportName}'`)
   //   .set('parameterType', 'true');
    //return this.http.get(`/runreports/FullParameterList`, {params: httpParams})
      //     .pipe(map((response: any) => response.data.map((entry: any) => new ReportParameter(entry.row)) ));
  //}

  /**
   * @param {string} inputString URL substring containing object details.
   * @returns {Observable<SelectOption[]>}
   */
  getSelectOptions(inputString: string): Observable<SelectOption[]> {
    const httpParams = new HttpParams().set('parameterType', 'true');
    return this.http.get(`/runreports/${inputString}`, {params: httpParams})
      .pipe(map((response: any) => response.data.map((entry: any) => new SelectOption(entry.row)) ));
  }

  /**
   * @param {number} reportId Report id for which pentaho parameters are needed.
   * @returns {Observable<any>}
   */
  getPentahoParams(reportId: number): Observable<any> {
    const httpParams = new HttpParams().set('fields', 'reportParameters');
    return this.http.get(`/reports/${reportId}`, {params: httpParams})
      .pipe(map((response: any) => response.reportParameters));
  }

  /**
   * Run Report Data for Table and SMS.
   * @param {any} reportName report name
   * @param {object} formData Form Data.
   * @returns {Observable<any>}
   */
  getRunReportData(reportName: string, formData: object): Observable<any> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(formData)) {
      httpParams = httpParams.set(key, value);
    }
    return this.http.get(`/runreports/${reportName}`, {params: httpParams});
  }

  /**
   * Run Report Data for Charts.
   * @param {any} reportName report name
   * @param {object} formData Form Data.
   * @returns {Observable<ChartData>}
   */
  getChartRunReportData(reportName: string, formData: object): Observable<ChartData> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(formData)) {
      httpParams = httpParams.set(key, value);
    }
    return this.http.get(`/runreports/${reportName}`, {params: httpParams})
    .pipe(map((response: any) => new ChartData(response)));
  }

  /**
   * Run Report Data for Pentaho.
   * @param {any} reportName report name
   * @param {object} formData Form Data.
   * @returns {Observable<any>}
   */
  getPentahoRunReportData(reportName: string, formData: object, tenantIdentifier: string, locale: string, dateFormat: string): Observable<any> {
    let httpParams = new HttpParams()
        .set('tenantIdentifier', tenantIdentifier)
        .set('locale', locale)
        .set('dateFormat', dateFormat);
    for (const [key, value] of Object.entries(formData)) {
      httpParams = httpParams.set(key, value);
    }
    return this.http.get(`/runreports/${reportName}`, {responseType: 'arraybuffer', observe: 'response', params: httpParams});
  }

}
