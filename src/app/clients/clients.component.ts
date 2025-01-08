/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { environment } from 'environments/environment';
import { ClientsService } from './clients.service';
import { AuthenticationService } from '../core/authentication/authentication.service'; // Add this import

@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
})
export class ClientsComponent implements OnInit {
  @ViewChild('showClosedAccounts') showClosedAccounts: MatCheckbox;

  displayedColumns = ['displayName', 'accountNumber', 'externalId', 'status', 'officeName'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  existsClientsToFilter = false;
  notExistsClientsToFilter = false;
  errorMessage: string | null = null;

  totalRows: number;
  isLoading = false;

  pageSize = 50;
  currentPage = 0;
  filterText = '';

  sortAttribute = '';
  sortDirection = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private clientService: ClientsService,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    // Debug permission check
    this.authService.hasPermission(this.clientService.getPermissionString('176'))
      .subscribe(
        (hasPermission: boolean) => console.log('Current permission status:', hasPermission),
        (error: Error) => console.error('Error checking permission:', error)
      );

    if (environment.preloadClients) {
      this.getClients();
    }
  }


  search(value: string) {
    this.filterText = value;
    this.resetPaginator();
    this.getClients();
  }

  private getClients() {
    this.isLoading = true;
    this.errorMessage = null;

    this.clientService.searchByText(
      this.filterText, 
      this.currentPage, 
      this.pageSize, 
      this.sortAttribute, 
      this.sortDirection
    ).subscribe({
      next: (data: any) => {
        if (data.error) {
          this.errorMessage = data.message;
          this.dataSource.data = [];
          this.totalRows = 0;
        } else {
          this.dataSource.data = data.content;
          this.totalRows = data.totalElements;
        }
        
        this.existsClientsToFilter = (data.numberOfElements > 0);
        this.notExistsClientsToFilter = !this.existsClientsToFilter;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'An unexpected error occurred while loading clients.';
        this.dataSource.data = [];
        this.totalRows = 0;
        this.isLoading = false;
        this.existsClientsToFilter = false;
        this.notExistsClientsToFilter = true;
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getClients();
  }

  sortChanged(event: Sort) {
    if (event.direction === '') {
      this.sortDirection = '';
      this.sortAttribute = '';
    } else {
      this.sortAttribute = event.active;
      this.sortDirection = event.direction;
    }
    this.resetPaginator();
    this.getClients();
  }

  private resetPaginator() {
    this.currentPage = 0;
    this.paginator.firstPage();
  }
}