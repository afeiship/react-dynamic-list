import { useEffect, useRef } from 'react';
import { ReactList, type ReactListProps, INDEX } from '@jswork/react-list';
import { useListContext } from './use-list-context';
import type { ChangeEvent } from './types';
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
  const { list, change, reset } = useListContext<T>(name, { min, max, defaults });
  const dataRef = useRef(data);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    if (data && data !== dataRef.current) {
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
