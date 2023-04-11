import React from "react";
import { createUseStyles } from "react-jss";

interface FlexProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  justify?:
    | "center"
    | "space-between"
    | "space-around"
    | "flex-start"
    | "flex-end";
  align?: "center" | "baseline" | "flex-start" | "flex-end";
  direction?: "column" | "row";
  children?: React.ReactChild | React.ReactChild[];
}

export default function Flex({
  children,
  justify,
  align,
  direction,
  style = {},
  ...props
}: FlexProps) {
  return (
    <div
      {...props}
      style={{
        ...style,
        display: "flex",
        alignItems: align,
        justifyContent: justify,
        flexDirection: direction,
      }}
    >
      {children}
    </div>
  );
}
