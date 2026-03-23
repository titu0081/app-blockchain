import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProcessStep, ProcessStepHistory, StepFormModel } from '../models/process.models';

@Injectable({ providedIn: 'root' })
export class ProcessService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = 'http://localhost:3000';

  getSteps(): Observable<ProcessStep[]> {
    return this.http.get<ProcessStep[]>(`${this.apiBase}/steps`);
  }

  createStep(payload: StepFormModel): Observable<ProcessStep> {
    return this.http.post<ProcessStep>(`${this.apiBase}/steps`, payload);
  }

  updateStep(id: number, payload: StepFormModel): Observable<ProcessStep> {
    return this.http.put<ProcessStep>(`${this.apiBase}/steps/${id}`, payload);
  }

  deleteStep(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/steps/${id}`);
  }

  getHistory(): Observable<ProcessStepHistory[]> {
    return this.http.get<ProcessStepHistory[]>(`${this.apiBase}/history`);
  }

  getHistoryByStep(id: number): Observable<ProcessStepHistory[]> {
    return this.http.get<ProcessStepHistory[]>(`${this.apiBase}/steps/${id}/history`);
  }
}
