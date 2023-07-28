type ActionType = 'add' | 'update' | 'delete' | 'none';

export interface Action<T> {
  item: T;
  action: ActionType;
}