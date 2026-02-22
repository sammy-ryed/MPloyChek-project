// core/models/record.model.ts
export type RecordStatus   = 'Completed' | 'In Progress' | 'Pending';
export type RecordPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Record {
  id: string;
  userId: string;
  ownerName?: string;
  title: string;
  category: string;
  priority: RecordPriority;
  status: RecordStatus;
  amount: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface RecordsResponse {
  success: boolean;
  role: string;
  total: number;
  data: Record[];
}
