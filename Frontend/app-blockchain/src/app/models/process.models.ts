export interface ProcessStep {
  id: number;
  name: string;
  description: string | null;
  step_order: number;
  previous_step_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProcessStepHistory {
  id: number;
  step_id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: string | null;
  changed_at: string;
}

export interface ChainedHistoryItem extends ProcessStepHistory {
  previousHash: string;
  currentHash: string;
}

export interface StepFormModel {
  name: string;
  description: string;
  step_order: number;
  previous_step_id: number | null;
}
