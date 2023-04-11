import React from "react";
import { createUseStyles } from "react-jss";
import CircleGraph from "./CircleGraph";
import Flex from "./Flex";

interface CircleLayoutsProps {
  layouts: any[];
  circlePosition: any;
  activeLayout: number;
  onLayoutClick: (index: number) => void;
}

export default function CircleLayouts({
  layouts,
  circlePosition,
  activeLayout,
  onLayoutClick,
}: CircleLayoutsProps) {
  const classes = useStyle();

  return (
    <Flex align="center" style={{ overflowX: "auto", width: "100vw" }}>
      {layouts.map((data, index) => (
        <div
          onClick={() => onLayoutClick(index)}
          style={{
            borderRadius: 10,
            background:
              index === activeLayout ? "rgba(0,0,0,0.05)" : "transparent",
          }}
        >
          <CircleGraph
            data={data}
            mainContainerWidth={circlePosition.containerWidth}
          />
        </div>
      ))}
    </Flex>
  );
}

const useStyle = createUseStyles(({ colors }: Theme) => ({}));
