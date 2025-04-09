import React from 'react';
import { View, Pressable, PressableProps } from 'react-native';

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
    <Pressable {...pressableProps}>
      <View className={ className ?? 'flex-1 justify-center items-center bg-slate-800 rounded-2xl' }>
        { children }
      </View>
    </Pressable>
  );
}