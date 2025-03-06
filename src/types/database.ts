// Define TypeScript interfaces for database tables
// Create interfaces for Parent, Kid, Task, and Reward
// Include fields for each entity based on the database schema

export interface Parent {
  id: number;
  name: string;
  email: string;
}

export interface Kid {
  id: number;
  parent_id: number;
  name: string;
  currency: number;
}

export interface Task {
  id: number;
  name: string;
  assigned_to: number;
  reward_value: number;
  completed: boolean;
}

export interface Reward {
  id: number;
  name: string;
  cost: number;
  parent_id: number;
}
