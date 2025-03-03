/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../core/authentication/authentication.service';  // adjust path as needed
import { mergeMap } from 'rxjs/operators';
/**
 * Clients service.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient,
    private auth: AuthenticationService
  ) { }


  private readonly CLIENT_IMAGE_PERMISSIONS = {
    '176': 'READ_CLIENT_IMAGE',
    '177': 'CREATE_CLIENT_IMAGE', 
    '178': 'DELETE_CLIENT_IMAGE'
  } as const;
  
  // Add a helper method to get permission string from ID
  public getPermissionString(permissionId: keyof typeof this.CLIENT_IMAGE_PERMISSIONS) {
    return this.CLIENT_IMAGE_PERMISSIONS[permissionId];
  }



  getFilteredClients(orderBy: string, sortOrder: string, orphansOnly: boolean, displayName: string, officeId?: any): Observable<any> {
    let httpParams = new HttpParams()
      .set('displayName', displayName)
      .set('orphansOnly', orphansOnly.toString())
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy);
    if (officeId) {
      httpParams = httpParams.set('officeId', officeId);
    }
    return this.http.get('/clients', { params: httpParams });
  }

  getClients(orderBy: string, sortOrder: string, offset: number, limit: number): Observable<any> {
    const httpParams = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('sortOrder', sortOrder)
      .set('orderBy', orderBy);
    return this.http.get('/clients', { params: httpParams });
  }

  getClientTemplate(): Observable<any> {
    return this.http.get('/clients/template');
  }

  getClientWithOfficeTemplate(officeId: number): Observable<any> {
    return this.http.get(`/clients/template?officeId=${officeId}&staffInSelectedOfficeOnly=true`);
  }

  getClientData(clientId: string): Observable<any> {
    return this.http.get(`/clients/${clientId}`).pipe(
      catchError(error => {
        if (error.status === 500) {
          console.warn('Error loading client data:', error);
          return of({ 
            error: true,
            message: 'Unable to load client data',
            // Include minimal client data structure to prevent UI breaks
            id: clientId,
            status: { value: 'Unknown' },
            active: false
          });
        }
        throw error;
      })
    );
  }

  createClient(client: any) {
    return this.http.post(`/clients`, client);
  }

  updateClient(clientId: string, client: any) {
    return this.http.put(`/clients/${clientId}`, client);
  }

  deleteClient(clientId: string) {
    return this.http.delete(`/clients/${clientId}`);
  }


  getClientDataAndTemplate(clientId: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('template', 'true')
      .set('staffInSelectedOfficeOnly', 'true');
    return this.http.get(`/clients/${clientId}`, { params: httpParams }).pipe(
      catchError(error => {
        if (error.status === 500) {
          console.warn('Error loading client data and template:', error);
          return of({
            error: true,
            message: 'Unable to load client data',
            // Include minimal client data structure
            id: clientId,
            status: { value: 'Unknown' },
            active: false
          });
        }
        throw error;
      })
    );
  }

    getClientDatatables() {
    const httpParams = new HttpParams().set('apptable', 'm_client');
    return this.http.get(`/datatables`, { params: httpParams });
  }

  getClientDatatable(clientId: string, datatableName: string) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.get(`/datatables/${datatableName}/${clientId}`, { params: httpParams });
  }

  addClientDatatableEntry(clientId: string, datatableName: string, data: any) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.post(`/datatables/${datatableName}/${clientId}`, data, { params: httpParams });
  }

  editClientDatatableEntry(clientId: string, datatableName: string, data: any) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.put(`/datatables/${datatableName}/${clientId}`, data, { params: httpParams });
  }

  deleteDatatableContent(clientId: string, datatableName: string) {
    const httpParams = new HttpParams().set('genericResultSet', 'true');
    return this.http.delete(`/datatables/${datatableName}/${clientId}`, { params: httpParams });
  }

  getClientAccountData(clientId: string) {
    return this.http.get(`/clients/${clientId}/accounts`);
  }

  getClientChargesData(clientId: string) {
    const httpParams = new HttpParams().set('pendingPayment', 'true');
    return this.http.get(`/clients/${clientId}/charges`, { params: httpParams });
  }

  getSelectedChargeData(clientId: string, chargeId: string) {
    const httpParams = new HttpParams().set('associations', 'all');
    return this.http.get(`/clients/${clientId}/charges/${chargeId}`, { params: httpParams });
  }

  /**
   * @param chargeData Charge Data to be waived.
   */
  waiveClientCharge(chargeData: any) {
    const httpParams = new HttpParams().set('command', 'waive');
    return this.http.post(`/clients/${chargeData.clientId}/charges/${chargeData.resourceType}`, chargeData, { params: httpParams });
  }

  getAllClientCharges(clientId: string) {
    return this.http.get(`/clients/${clientId}/charges`);
  }

  /**
   * @param transactionData Transaction Data to be undone.
   */
  undoTransaction(transactionData: any) {
    return this.http.post(`/clients/${transactionData.clientId}/transactions/${transactionData.transactionId}?command=undo`, transactionData);
  }

  /**
   * @param clientId Client Id of the relevant charge.
   * @param chargeId Charge Id to be deleted.
   */
  deleteCharge(clientId: string, chargeId: string) {
    return this.http.delete(`/clients/${clientId}/charges/${chargeId}?associations=all`);
  }

  /*
   * @param clientId Client Id of payer.
   * @param chargeId Charge Id of the charge to be paid.
   */
  getClientTransactionPay(clientId: string, chargeId: string) {
    return this.http.get(`/clients/${clientId}/charges/${chargeId}`);
  }

  /**
   * @param clientId Client Id of the payment.
   * @param chargeId Charge Id of the payment.
   * @param payment  Client Payment data.
   */
  payClientCharge(clientId: string, chargeId: string, payment: any) {
    const httpParams = new HttpParams().set('command', 'paycharge');
    return this.http.post(`/clients/${clientId}/charges/${chargeId}?command=paycharge`, payment, { params: httpParams });
  }

  getClientSummary(clientId: string) {
    const httpParams = new HttpParams().set('R_clientId', clientId)
      .set('genericResultSet', 'false');
    return this.http.get(`/runreports/ClientSummary`, { params: httpParams });
  }



  getClientProfileImage(clientId: string) {
    const httpParams = new HttpParams().set('maxHeight', '150');
    
    console.log('Checking permission:', this.getPermissionString('176'));
    return this.auth.hasPermission(this.getPermissionString('176')).pipe(
      mergeMap((hasPermission: boolean) => {
        if (hasPermission) {
          return this.http.skipErrorHandler().get(
            `/clients/${clientId}/images`,
            { params: httpParams, responseType: 'text' }
          );
        } else {
          console.warn('No permission to view client images (ID: 176)');
          return of(null);
        }
      })
    );
  }

  


 // getClientProfileImage(clientId: string) {
   // const httpParams = new HttpParams().set('maxHeight', '150');
 //   return this.http.skipErrorHandler().get(`/clients/${clientId}/images`, { params: httpParams, responseType: 'text' });
 // }

 
 uploadClientProfileImage(clientId: string, image: File) {
  return this.auth.hasPermission(this.getPermissionString('177')).pipe(
    mergeMap((hasPermission: boolean) => {
      if (hasPermission) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('filename', 'file');
        return this.http.post(`/clients/${clientId}/images`, formData);
      } else {
        console.warn('No permission to upload client images (ID: 177)');
        return of(null);
      }
    })
  );
}


  uploadCapturedClientProfileImage(clientId: string, imageURL: string) {
    return this.http.post(`/clients/${clientId}/images`, imageURL);
  }


  deleteClientProfileImage(clientId: string) {
    return this.auth.hasPermission(this.getPermissionString('178')).pipe(
      mergeMap((hasPermission: boolean) => {
        if (hasPermission) {
          return this.http.delete(`/clients/${clientId}/images`);
        } else {
          console.warn('No permission to delete client images (ID: 178)');
          return of(null);
        }
      })
    );
  }



  uploadClientSignatureImage(clientId: string, signature: File) {
    const formData = new FormData();
    formData.append('file', signature);
    formData.append('name', 'clientSignature');
    formData.append('description', 'Client signature');
    return this.http.post(`/clients/${clientId}/documents`, formData);
  }

  getClientSignatureImage(clientId: string, documentId: string) {
    return this.http.get(`/clients/${clientId}/documents/${documentId}/attachment`, { responseType: 'blob' });
  }

  getClientFamilyMembers(clientId: string) {
    return this.http.get(`/clients/${clientId}/familymembers`);
  }

  getClientFamilyMember(clientId: string, familyMemberId: string) {
    return this.http.get(`/clients/${clientId}/familymembers/${familyMemberId}`);
  }

  addFamilyMember(clientId: string, familyMemberData: any) {
    return this.http.post(`/clients/${clientId}/familymembers`, familyMemberData);
  }

  editFamilyMember(clientId: string, familyMemberId: any, familyMemberData: any) {
    return this.http.put(`/clients/${clientId}/familymembers/${familyMemberId}`, familyMemberData);
  }

  deleteFamilyMember(clientId: string, familyMemberId: string) {
    return this.http.delete(`/clients/${clientId}/familymembers/${familyMemberId}`);
  }

  getClientIdentifiers(clientId: string) {
    return this.http.get(`/clients/${clientId}/identifiers`);
  }

  getClientIdentifierTemplate(clientId: string) {
    return this.http.get(`/clients/${clientId}/identifiers/template`);
  }

  addClientIdentifier(clientId: string, identifierData: any) {
    return this.http.post(`/clients/${clientId}/identifiers`, identifierData);
  }

  deleteClientIdentifier(clientId: string, identifierId: string) {
    return this.http.delete(`/clients/${clientId}/identifiers/${identifierId}`);
  }

  getClientIdentificationDocuments(documentId: string) {
    return this.http.get(`/client_identifiers/${documentId}/documents`);
  }

  downloadClientIdentificationDocument(parentEntityId: string, documentId: string) {
    return this.http.get(`/client_identifiers/${parentEntityId}/documents/${documentId}/attachment`, { responseType: 'blob' });
  }

  uploadClientIdentifierDocument(identifierId: string, documentData: any) {
    return this.http.post(`/client_identifiers/${identifierId}/documents`, documentData);
  }

  getClientDocuments(clientId: string) {
    return this.http.get(`/clients/${clientId}/documents`);
  }

  downloadClientDocument(parentEntityId: string, documentId: string) {
    return this.http.get(`/clients/${parentEntityId}/documents/${documentId}/attachment`, { responseType: 'blob' });
  }

  uploadClientDocument(clientId: string, documentData: any) {
    return this.http.post(`/clients/${clientId}/documents`, documentData);
  }

  deleteClientDocument(parentEntityId: string, documentId: string) {
    return this.http.delete(`/clients/${parentEntityId}/documents/${documentId}`);
  }

  getClientNotes(clientId: string) {
    return this.http.get(`/clients/${clientId}/notes`);
  }

  createClientNote(clientId: string, noteData: any) {
    return this.http.post(`/clients/${clientId}/notes`, noteData);
  }

  editClientNote(clientId: string, noteId: string, noteData: any) {
    return this.http.put(`/clients/${clientId}/notes/${noteId}`, noteData);
  }

  deleteClientNote(clientId: string, noteId: string) {
    return this.http.delete(`/clients/${clientId}/notes/${noteId}`);
  }

  getAddressFieldConfiguration() {
    return this.http.get(`/fieldconfiguration/ADDRESS`);
  }

  getClientAddressData(clientId: string) {
    return this.http.get(`/client/${clientId}/addresses`);
  }

  getClientAddressTemplate() {
    return this.http.get(`/client/addresses/template`);
  }

  createClientAddress(clientId: string, addressTypeId: string, addressData: any) {
    return this.http.post(`/client/${clientId}/addresses?type=${addressTypeId}`, addressData);
  }

  editClientAddress(clientId: string, addressTypeId: string, addressData: any) {
    return this.http.put(`/client/${clientId}/addresses?type=${addressTypeId}`, addressData);
  }

  executeClientCommand(clientId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/clients/${clientId}`, data, { params: httpParams });
  }

  getClientCommandTemplate(command: string): Observable<any> {
    const httpParams = new HttpParams().set('commandParam', command);
    return this.http.get(`/clients/template`, { params: httpParams });
  }

  getClientTransferProposalDate(clientId: any): Observable<any> {
    return this.http.get(`/clients/${clientId}/transferproposaldate`);
  }

  getClientChargeTemplate(clientId: any): Observable<any> {
    return this.http.get(`/clients/${clientId}/charges/template`);
  }

  getChargeAndTemplate(chargeId: any): Observable<any> {
    const httpParams = new HttpParams().set('template', 'true');
    return this.http.get(`/charges/${chargeId}`, { params: httpParams });
  }

  createClientCharge(clientId: any, charge: any) {
    return this.http.post(`/clients/${clientId}/charges`, charge);
  }

  getClientReportTemplates() {
    const httpParams = new HttpParams()
          .set('entityId', '0')
          .set('typeId', '0');
    return this.http.get('/templates', { params: httpParams });
  }

  retrieveClientReportTemplate(templateId: string, clientId: string) {
    const httpParams = new HttpParams().set('clientId', clientId);
    return this.http.post(`/templates/${templateId}`, {}, { params: httpParams, responseType: 'text' });
  }

  /**
   * @returns {Observable<any>} Offices data
   */
  getOffices(): Observable<any> {
    return this.http.get('/offices');
  }

  /**
   * returns the list of survey data of the particular Client
   * @param clientId
   */
  getSurveys(clientId: string) {
    return this.http.get(`/surveys/scorecards/clients/${clientId}`);
  }

  /**
   * returns the list of survey types and questions
   */
  getAllSurveysType() {
    return this.http.get('/surveys');
  }

  /**
   * returns the response from the post request for that survey
   * @param surveyId
   * @param surveyData Survey Data submitted by client
   */
  createNewSurvey(surveyId: Number, surveyData: any) {
    return this.http.post(`/surveys/scorecards/${surveyId}`, surveyData);
  }

  /**
   * @param userData User Data.
   */
  createSelfServiceUser(userData: any) {
    return this.http.post(`/users`, userData);
  }

  /**
   * @param clientId Client ID.
   * @param collateralData Collateral Data
   */
  createClientCollateral(clientId: any, collateralData: any) {
    return this.http.post(`/clients/${clientId}/collaterals`, collateralData);
  }

  /**
   * @param clientId Client ID.
   */
  getCollateralTemplate(clientId: any) {
    return this.http.get(`/clients/${clientId}/collaterals/template`);
  }


  searchByText(text: string, page: number, pageSize: number, sortAttribute: string = '', sortDirection: string = ''): Observable<any> {
    let request: any = {
        request: {
          text
        },
        page,
        size: pageSize
    };
    if (sortAttribute !== '' && sortDirection !== '') {
      request = {
        ...request,
        sorts: [
          {
            direction: sortDirection,
            property: sortAttribute
          }
        ]
      };
    }

    return this.http.post(`/v2/clients/search`, request).pipe(
      catchError(error => {
        if (error.status === 500 && error.error?.path?.includes('/clients/')) {
          console.warn('Client data error:', error);
          // Return a default response structure that matches what the component expects
          return of({
            content: [],
            totalElements: 0,
            numberOfElements: 0,
            error: true,
            message: 'Unable to load complete client data'
          });
        }
        throw error; // rethrow other errors
      })
    );
}

}