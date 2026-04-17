# react-dynamic-list
> React hook for reactive dynamic list state across components.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![download][download-image]][download-url]

## installation
```shell
npm install -S @jswork/react-dynamic-list
```

## usage
  ```js
  import { DynamicList } from '@jswork/react-dynamic-list';
  import { TodoItem } from './components/todo/todo-item';
  import { TodoEmpty } from './components/todo/todo-empty';
  import { TodoControls } from './components/todo/todo-controls';
  import { initialData, defaults } from './components/todo/types';
  import type { Todo } from './components/todo/types';

  export default function App() {
    return (
      <div className="min-h-screen bg-base-200 p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">React Dynamic List</h1>
            <span className="badge badge-warning">Build: {BUILD_TIME}</span>
          </div>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Todo Demo</h2>
              <TodoControls />
              <DynamicList<Todo>
                name="pg-todo"
                data={initialData}
                defaults={defaults}
                max={8}
                slots={{ item: TodoItem, empty: TodoEmpty }}
                onChange={e => console.log('change: ', e.data)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

## preview
- https://afeiship.github.io/react-dynamic-list/

## license
Code released under [the MIT license](https://github.com/afeiship/react-dynamic-list/blob/master/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/react-dynamic-list
[version-url]: https://npmjs.org/package/@jswork/react-dynamic-list

[license-image]: https://img.shields.io/npm/l/@jswork/react-dynamic-list
[license-url]: https://github.com/afeiship/react-dynamic-list/blob/master/LICENSE.txt

[download-image]: https://img.shields.io/npm/dm/@jswork/react-dynamic-list
[download-url]: https://www.npmjs.com/package/@jswork/react-dynamic-list
