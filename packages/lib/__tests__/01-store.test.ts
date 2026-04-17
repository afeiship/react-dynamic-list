// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { getList, setList, addToList, removeAt, updateAt } from '../src/store';

describe('store', () => {
  beforeEach(() => {
    setList('store-test', []);
  });

  it('getList returns empty array for new name', () => {
    expect(getList('new-name')).toEqual([]);
  });

  it('addToList appends item', () => {
    addToList('store-test', 'a');
    addToList('store-test', 'b');
    expect(getList('store-test')).toEqual(['a', 'b']);
  });

  it('removeAt removes item at index', () => {
    setList('store-test', ['a', 'b', 'c']);
    removeAt('store-test', 1);
    expect(getList('store-test')).toEqual(['a', 'c']);
  });

  it('updateAt updates item at index', () => {
    setList('store-test', [1, 2, 3]);
    updateAt('store-test', 1, (v: number) => v * 10);
    expect(getList('store-test')).toEqual([1, 20, 3]);
  });

  it('setList replaces entire list', () => {
    setList('store-test', ['x', 'y']);
    expect(getList('store-test')).toEqual(['x', 'y']);
  });
});
