import { SvgCircle, SvgDot, SvgLine, SvgText } from "./CustomSvgs";

export default function CircleGraph({ data, mainContainerWidth }: any) {
  return (
    <svg height={125} width={mainContainerWidth / 4}>
      <SvgCircle r={180} dBy={4} strokeWidth="2" />

      {data.lines.map((line: any, index: number) => (
        <SvgLine key={index} {...line} dBy={4} />
      ))}

      {data.dots.map((dot: any, index: number) => (
        <SvgDot key={index} {...dot} dBy={4} />
      ))}
      {data.count.map((dot: any, index: number) => (
        <SvgText key={index} {...dot} dBy={4}>
          {index + 1}
        </SvgText>
      ))}
    </svg>
  );
}
