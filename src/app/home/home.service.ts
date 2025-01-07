/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Home Service
 */
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  // Report ID mappings
  private readonly reportIds: { [key: string]: number } = {
    'Demand-Vs-Collection': 37,
    'Disbursal-Vs-Awaitingdisbursal': 38,
    'Client-Trends-By-Day': 2000,
    'Client-Trends-By-Week': 2001,
    'Client-Trends-By-Month': 2002,
    'Loan-Trends-By-Day': 2003,    // You'll need to add these IDs
    'Loan-Trends-By-Week': 2004,   // to your database and map them
    'Loan-Trends-By-Month': 2005   // in the report service as well
  };

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * Generic method to get report data
   * @param {string} reportName Report identifier
   * @param {number} officeId Office Id
   * @returns {Observable<any>}
   */
  private getReportData(reportName: string, officeId: number): Observable<any> {
    const reportId = this.reportIds[reportName];
    const httpParams = new HttpParams()
      .set('R_officeId', officeId.toString())
      .set('genericResultSet', 'false');
    
    return this.http.get(`/reports/${reportId}`, { params: httpParams });
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getCollectedAmount(officeId: number): Observable<any> {
    return this.getReportData('Demand-Vs-Collection', officeId);
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getDisbursedAmount(officeId: number): Observable<any> {
    return this.getReportData('Disbursal-Vs-Awaitingdisbursal', officeId);
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByDay(officeId: number): Observable<any> {
    return this.getReportData('Client-Trends-By-Day', officeId);
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByWeek(officeId: number): Observable<any> {
    return this.getReportData('Client-Trends-By-Week', officeId);
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getClientTrendsByMonth(officeId: number): Observable<any> {
    return this.getReportData('Client-Trends-By-Month', officeId);
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByDay(officeId: number): Observable<any> {
    return this.getReportData('Loan-Trends-By-Day', officeId);
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByWeek(officeId: number): Observable<any> {
    return this.getReportData('Loan-Trends-By-Week', officeId);
  }

  /**
   * @param {number} officeId Office Id.
   * @returns {Observable<any>}
   */
  getLoanTrendsByMonth(officeId: number): Observable<any> {
    return this.getReportData('Loan-Trends-By-Month', officeId);
  }
}