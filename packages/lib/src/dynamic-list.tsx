import { useEffect, useRef } from 'react';
import { ReactList, type ReactListProps, INDEX } from '@jswork/react-list';
import { useCommand } from './use-command';
import type { ChangeEvent } from './types';
import equal from 'fast-deep-equal';
import React from 'react';

export interface DynamicListProps<T = unknown> extends Omit<ReactListProps<T>, 'data'> {
  name: string;
  defaults: () => T;
  data?: T[];
  min?: number;
  max?: number;
  onChange?: (event: ChangeEvent<T>) => void;
}

export function DynamicList<T = unknown>(props: DynamicListProps<T>) {
  const { name, data, min, max, defaults, onChange, keyExtractor = INDEX, ...rest } = props;
  const { state, actions } = useCommand<T>(name, { min, max, defaults });
  const { list, change } = state;
  const { reset } = actions;
  const dataRef = useRef<T[] | undefined>(undefined);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    if (data && !equal(data, dataRef.current)) {
      reset(data);
    }
    dataRef.current = data;
  }, [data, reset]);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (change) onChangeRef.current?.(change);
  }, [change]);

  return <ReactList<T> data={list} keyExtractor={keyExtractor} {...rest} />;
}
