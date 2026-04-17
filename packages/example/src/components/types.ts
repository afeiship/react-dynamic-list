export interface Item {
  id: number;
  title: string;
}

export let uid = 6;

export const defaults = () => ({ id: ++uid, title: `Item ${uid}` });

export const initialData: Item[] = [
  { id: 1, title: 'Learn React' },
  { id: 2, title: 'Build a project' },
  { id: 3, title: 'Deploy to production' },
];

export let prefillUid = 10;

export const prefillDefaults = () => ({ id: ++prefillUid, title: `Item ${prefillUid}` });

export const prefillInitialData: Item[] = [
  { id: 7, title: 'TypeScript' },
  { id: 8, title: 'Vite' },
  { id: 9, title: 'Tailwind CSS' },
  { id: 10, title: 'DaisyUI' },
];
