import React from 'react';
import { Pressable, PressableProps } from 'react-native';

import "@/global.css";

type Props = {
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = Props & PressableProps;

export function Button({
  className,
  children,
  ...pressableProps
}: ButtonProps) {

  return (
    <Pressable className={ className ?? 'flex-wrap justify-center items-center bg-slate-800 rounded-2xl' } {...pressableProps}>
      { children }
    </Pressable>
  );
}