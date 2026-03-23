import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiErrorModel } from '../../models/api-error.model';
import { ChainedHistoryItem, ProcessStep, ProcessStepHistory, StepFormModel } from '../../models/process.models';
import { ProcessService } from '../../services/process.service';

@Component({
  selector: 'app-blockchain',
  imports: [CommonModule, FormsModule],
  templateUrl: './blockchain.html',
  styleUrl: './blockchain.scss',
})
export class Blockchain implements OnInit {
  private readonly processService = inject(ProcessService);

  steps: ProcessStep[] = [];
  history: ChainedHistoryItem[] = [];
  loading = false;
  loadingHistory = false;
  editingStepId: number | null = null;
  errorMessage = '';
  successMessage = '';

  formModel: StepFormModel = {
    name: '',
    description: '',
    step_order: 1,
    previous_step_id: null
  };

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.loadSteps();
    this.loadHistory();
  }

  loadSteps(): void {
    this.loading = true;
    this.processService.getSteps().subscribe({
      next: (steps) => {
        this.steps = steps;
        this.loading = false;
      },
      error: (error: ApiErrorModel) => {
        this.loading = false;
        this.errorMessage = `Error al cargar pasos: ${error.message}`;
      }
    });
  }

  loadHistory(stepId?: number): void {
    this.loadingHistory = true;
    const request$ = stepId
      ? this.processService.getHistoryByStep(stepId)
      : this.processService.getHistory();

    request$.subscribe({
      next: async (records) => {
        this.history = await this.buildChainedHistory(records);
        this.loadingHistory = false;
      },
      error: (error: ApiErrorModel) => {
        this.loadingHistory = false;
        this.errorMessage = `Error al cargar historial: ${error.message}`;
      }
    });
  }

  submitForm(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.formModel.name.trim() || !this.formModel.step_order) {
      this.errorMessage = 'Nombre y orden son obligatorios.';
      return;
    }

    const payload: StepFormModel = {
      name: this.formModel.name.trim(),
      description: this.formModel.description?.trim() || '',
      step_order: Number(this.formModel.step_order),
      previous_step_id: this.formModel.previous_step_id
        ? Number(this.formModel.previous_step_id)
        : null
    };

    const request$ = this.editingStepId
      ? this.processService.updateStep(this.editingStepId, payload)
      : this.processService.createStep(payload);

    request$.subscribe({
      next: () => {
        this.successMessage = this.editingStepId
          ? 'Paso actualizado correctamente.'
          : 'Paso creado correctamente.';
        this.cancelEdit();
        this.refreshData();
      },
      error: (error: ApiErrorModel) => {
        this.errorMessage = `No se pudo guardar: ${error.message}`;
      }
    });
  }

  setEdit(step: ProcessStep): void {
    this.editingStepId = step.id;
    this.formModel = {
      name: step.name,
      description: step.description || '',
      step_order: step.step_order,
      previous_step_id: step.previous_step_id
    };
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.editingStepId = null;
    this.formModel = {
      name: '',
      description: '',
      step_order: 1,
      previous_step_id: null
    };
  }

  removeStep(step: ProcessStep): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.processService.deleteStep(step.id).subscribe({
      next: () => {
        this.successMessage = 'Paso eliminado correctamente.';
        this.cancelEdit();
        this.refreshData();
      },
      error: (error: ApiErrorModel) => {
        this.errorMessage = `No se pudo eliminar: ${error.message}`;
      }
    });
  }

  showHistoryByStep(step: ProcessStep): void {
    this.loadHistory(step.id);
  }

  resetHistoryFilter(): void {
    this.loadHistory();
  }

  private async buildChainedHistory(records: ProcessStepHistory[]): Promise<ChainedHistoryItem[]> {
    const ordered = [...records].sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());

    let previousHash = 'GENESIS';
    const withHash: ChainedHistoryItem[] = [];

    for (const record of ordered) {
      const currentHash = await this.sha256(
        `${previousHash}|${record.id}|${record.step_id}|${record.action}|${record.changed_at}|${JSON.stringify(record.new_data || {})}`
      );

      withHash.push({
        ...record,
        previousHash,
        currentHash
      });

      previousHash = currentHash;
    }

    return withHash.reverse();
  }

  private async sha256(value: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

}
