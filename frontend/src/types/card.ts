export type CardStatus = 'new' | 'process' | 'done';
export type CardPriority = 'low' | 'medium' | 'high';

export interface Card {
  id: number;
  title: string;
  description?: string;
  status: CardStatus;
  priority: CardPriority;
  order_index: number;
  project_id: number;
  assignee_id?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CardCreate {
  title: string;
  description?: string;
  priority?: CardPriority;
  project_id: number;
  due_date?: string;
}

export interface CardUpdate {
  title?: string;
  description?: string;
  status?: CardStatus;
  priority?: CardPriority;
  assignee_id?: number;
  due_date?: string;
  order_index?: number;
}
