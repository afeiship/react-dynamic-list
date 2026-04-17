export interface Item {
  id: number;
  title: string;
}

export let uid = 3;

export const defaults = () => ({ id: ++uid, title: `Item ${uid}` });

export const initialData: Item[] = [
  { id: 1, title: 'Learn React' },
  { id: 2, title: 'Build a project' },
  { id: 3, title: 'Deploy to production' },
];
