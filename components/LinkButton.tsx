import React from 'react';
import { View } from 'react-native';
import { Link, Href } from 'expo-router'

import "@/global.css";

type Props = {
  href: Href;
  className?: string;
  children: React.ReactNode;
};

export function LinkButton({
  href,
  className,
  children
}: Props) {

  return (
    <Link href={href}>
      <View className={ className ?? 'flex-wrap justify-center items-center bg-slate-800 rounded-2xl' }>
        { children }
      </View>
    </Link>
  );
}