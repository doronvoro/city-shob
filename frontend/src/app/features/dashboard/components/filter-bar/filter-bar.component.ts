import { Component, OnInit, OnDestroy, inject, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TaskFilter, DEFAULT_TASK_FILTER } from '../../models/filter.model';
import { TaskPriority } from '../../../../core/constants';
import { FILTER_CONFIG } from '../../../../core/constants';

/**
 * Filter Bar Component - provides search and filter controls for tasks
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  @Input() initialFilter: TaskFilter = { ...DEFAULT_TASK_FILTER };
  @Output() filterChange = new EventEmitter<TaskFilter>();

  filterForm: FormGroup;
  readonly priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: TaskPriority.HIGH, label: 'High' },
    { value: TaskPriority.MEDIUM, label: 'Medium' },
    { value: TaskPriority.LOW, label: 'Low' },
  ];

  readonly statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  constructor() {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      priority: ['all'],
      status: ['all'],
    });
  }

  ngOnInit(): void {
    // Initialize form with provided filter or defaults
    this.filterForm.patchValue(this.initialFilter, { emitEvent: false });

    // Debounce search input
    this.filterForm.get('searchQuery')?.valueChanges
      .pipe(
        debounceTime(FILTER_CONFIG.DEBOUNCE_TIME),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.emitFilterChange());

    // Emit immediately for other filter changes (no debounce needed)
    this.filterForm.get('priority')?.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.emitFilterChange());

    this.filterForm.get('status')?.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.emitFilterChange());

    // Emit initial filter
    this.emitFilterChange();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Emit current filter values
   */
  private emitFilterChange(): void {
    const filter: TaskFilter = {
      searchQuery: this.filterForm.get('searchQuery')?.value || '',
      priority: this.filterForm.get('priority')?.value || 'all',
      status: this.filterForm.get('status')?.value || 'all',
    };
    this.filterChange.emit(filter);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.patchValue(DEFAULT_TASK_FILTER, { emitEvent: false });
    this.emitFilterChange();
  }

  /**
   * Clear search input only
   */
  clearSearch(): void {
    this.filterForm.patchValue({ searchQuery: '' }, { emitEvent: false });
    this.emitFilterChange();
  }

  /**
   * Check if any filter is active
   */
  hasActiveFilters(): boolean {
    const values = this.filterForm.value;
    return (
      (values.searchQuery?.trim() || '') !== '' ||
      values.priority !== 'all' ||
      values.status !== 'all'
    );
  }

  /**
   * Getter methods for form controls with proper typing
   */
  get searchQueryControl(): FormControl {
    return this.filterForm.get('searchQuery') as FormControl;
  }

  get priorityControl(): FormControl {
    return this.filterForm.get('priority') as FormControl;
  }

  get statusControl(): FormControl {
    return this.filterForm.get('status') as FormControl;
  }
}
