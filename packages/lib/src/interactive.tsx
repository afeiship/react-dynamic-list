import { useEffect, useRef } from "react";
import { ReactList, type ReactListProps, SELF } from "@jswork/react-list";
import { useListContext } from "./use-list-context";
import type { ChangeEvent, ListConstraints } from "./types";
import React from 'react';

export interface InteractiveProps<T = unknown> extends Omit<ReactListProps<T>, "data"> {
  name: string;
  data?: T[];
  onChange?: (event: ChangeEvent<T>) => void;
  constraints?: ListConstraints<T>;
}

export function Interactive<T = unknown>({
  name,
  data,
  onChange,
  constraints,
  keyExtractor = SELF,
  ...rest
}: InteractiveProps<T>) {
  const { list, change, reset } = useListContext<T>(name, constraints);
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
