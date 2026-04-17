export interface Todo {
  id: string;
  title: string;
  done: boolean;
}

export const defaults = (): Todo => ({ id: crypto.randomUUID(), title: '', done: false });

export const initialData: Todo[] = [
  { id: '1', title: 'Learn React', done: false },
  { id: '2', title: 'Build something', done: true },
];
