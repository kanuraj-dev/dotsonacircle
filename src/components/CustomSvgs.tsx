export const SvgWrapper = ({ dBy = 1, ...props }: any) => {
  return (
    <svg {...props} height={props.height / dBy} width={props.width / dBy} />
  );
};

export const SvgText = ({ dBy = 1, ...props }: any) => {
  return (
    <text
      style={{ fontSize: 12 / 2, cursor: "pointer" }}
      {...props}
      x={props?.x / dBy}
      y={props?.y / dBy}
    />
  );
};

export const SvgLine = ({ dBy = 1, ...props }: any) => {
  return (
    <line
      stroke="black"
      strokeWidth={1.5}
      {...props}
      x1={props.x1 / dBy}
      x2={props.x2 / dBy}
      y2={props.y2 / dBy}
      y1={props.y1 / dBy}
    />
  );
};

export const SvgDot = ({ dBy = 1, ...props }: any) => {
  return (
    <circle
      r={3}
      fill="red"
      stroke="red"
      {...props}
      cx={props?.x / dBy}
      cy={props?.y / dBy}
    />
  );
};

export const SvgCircle = ({ dBy = 1, ...props }: any) => {
  return (
    <circle
      cx="50%"
      cy="50%"
      stroke="black"
      fill="transparent"
      {...props}
      r={props.r / dBy}
    />
  );
};
