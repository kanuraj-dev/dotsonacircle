const compareDots = (dot1: any, dot2: any) =>
  Math.floor(dot1.x) === Math.floor(dot2.x) &&
  Math.floor(dot1.y) === Math.floor(dot2.y);

const compareLine = (line1: any, line2: any) =>
  (Math.floor(line1.x1) === Math.floor(line2.x1) &&
    Math.floor(line1.x2) === Math.floor(line2.x2) &&
    Math.floor(line1.y1) === Math.floor(line2.y1) &&
    Math.floor(line1.y2) === Math.floor(line2.y2)) ||
  (Math.floor(line1.x1) === Math.floor(line2.x2) &&
    Math.floor(line1.x2) === Math.floor(line2.x2) &&
    Math.floor(line1.y1) === Math.floor(line2.y2) &&
    Math.floor(line1.y2) === Math.floor(line2.y1));

const getDistance = (point1: any, point2: any) => {
  let xs = 0;
  let ys = 0;

  xs = point2.x - point1.x;
  xs = xs * xs;

  ys = point2.y - point1.y;
  ys = ys * ys;

  return Math.round(Math.sqrt(xs + ys));
};

const getAngleFromPoint = (point: any, centerPoint: any) => {
  let dy = point.y - centerPoint.y,
    dx = point.x - centerPoint.x;
  let theta = Math.atan2(dy, dx);
  let angle = ((theta * 180) / Math.PI) % 360;
  angle = angle < 0 ? 360 + angle : angle;
  return angle;
};

const getPointFromAngle = (currPoint: any, angle: any) => {
  let x = Math.round(Math.cos((angle * Math.PI) / 180) * 180 + currPoint.x);
  let y = Math.round(Math.sin((angle * Math.PI) / 180) * 180 + currPoint.y);
  return { x, y };
};

const getIntersection = (p0: any, p1: any, p2: any, p3: any) => {
  var s, s1_x, s1_y, s2_x, s2_y, t;

  s1_x = p1.x - p0.x;
  s1_y = p1.y - p0.y;
  s2_x = p3.x - p2.x;
  s2_y = p3.y - p2.y;
  s =
    (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)) /
    (-s2_x * s1_y + s1_x * s2_y);
  t =
    (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)) /
    (-s2_x * s1_y + s1_x * s2_y);
  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    return {
      x: p0.x + t * s1_x,
      y: p0.y + t * s1_y,
    };
  }
  return null;
};

const calculateRegion = (n: number) => {
  let z = 1 / 24;

  let a = Math.pow(n, 4);
  let b = 6 * Math.pow(n, 3);
  let c = 23 * Math.pow(n, 2);
  let d = 18 * n;

  return z * (a - b + c - d + 24);
};

const reducesLines = (linesArr: any[]) =>
  linesArr.reduce((prev, curr) => {
    if (
      prev.findIndex(
        (item: any) =>
          Math.floor(item.x1) === Math.floor(curr?.x2) &&
          Math.floor(item.y1) === Math.floor(curr?.y2) &&
          Math.floor(item.x2) === Math.floor(curr?.x1) &&
          Math.floor(item.y2) === Math.floor(curr?.y1)
      ) === -1
    ) {
      return [...prev, curr];
    } else {
      return prev;
    }
  }, []);

export {
  compareDots,
  compareLine,
  getDistance,
  getAngleFromPoint,
  getPointFromAngle,
  getIntersection,
  calculateRegion,
  reducesLines,
};
