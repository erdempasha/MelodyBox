import React from 'react';
import { View } from 'react-native';
import { Link, Href, LinkProps } from 'expo-router'

import "@/global.css";

type Props = {
  href: Href;
  className?: string;
  children: React.ReactNode;
};

type LinkButtonProps = Props & LinkProps;

export function LinkButton({
  href,
  className,
  children,
  ...linkProps
}: LinkButtonProps) {

  return (
    <Link
      className={ className ?? 'flex-wrap justify-center items-center bg-slate-800 rounded-2xl' }
      href={href}
      {...linkProps}
    >
      { children }
    </Link>
  );
}