import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { Button, message, Modal } from "antd";
import Flex from "components/Flex";

import {
  compareDots,
  compareLine,
  getDistance,
  getAngleFromPoint,
  getPointFromAngle,
  getIntersection,
  calculateRegion,
  reducesLines,
} from "components/functions";
import { SvgCircle, SvgDot, SvgLine, SvgText } from "components/CustomSvgs";
import { DataType, DataInitalState } from "components/types";
import { UndoOutlined } from "@ant-design/icons";
import supabase from "utils/client";

const Configs = {
  containerHeight: 500,
  circleRadius: 180,
};

interface CirclePageProps {
  settings: any;
}

export default function CirclePage({ settings }: CirclePageProps) {
  const classes = useStyle();
  const [data, setData] = useState<DataType>(DataInitalState);

  const [activeIndex, setActiveIndex] = useState<any>(null);
  const [mouseEntered, setMouseEntered] = useState(false);
  const [circlePosition, setCirclePosition] = useState<any>(null);
  const [layouts, setLayouts] = useState<DataType[]>([]); // preloaded layout for dots 1-10
  const [layoutsUnedited, setLayoutsUnedited] = useState<DataType[]>([]); // preloaded layout for dots 1-10 (shouldn't be edited)
  const [lineInMaking, setLineInMaking] = useState<any>({});
  const [overlappingRegions, setOverlappingRegions] = useState(0); // count of overlapping regions (no of points where overlapping dots >= 3)
  const [canceledIntersection, setCanceledIntersection] = useState(0); // count of overlapping regions (no of points where overlapping dots >= 3)

  // states for admin options
  const [showRegionsCount, setShowRegionsCount] = useState(false);
  const [showIntersectionsCount, setShowIntersectionsCount] = useState(false);
  const [showIntersections, setShowIntersections] = useState(false);
  const [allowCountRegions, setAllowCountRegions] = useState(true);
  const [placementLocked, setPlacementLocked] = useState(false);
  const [drawLinesMode, setDrawLinesMode] = useState(false);
  const [maxDots, setMaxDots] = useState(9999);

  const handleRefreshCircle = () => {
    if (drawLinesMode) return;

    if (data.dots.length > 1) {
      let linesArr: any[] = [];
      for (let i = 0; i < data.dots.length; i++) {
        const dot = data.dots[i];

        for (let j = 0; j < data.dots.length; j++) {
          if (i === j) continue;

          linesArr.push({
            x1: data.dots[j].x,
            y1: data.dots[j].y,
            x2: dot.x,
            y2: dot.y,
          });
        }
      }

      setData((curr) => ({ ...curr, lines: reducesLines(linesArr) }));
    } else {
      // setData(DataInitalState);
    }
  };

  const handleAddDot = (e: any) => {
    e.stopPropagation();

    if (placementLocked) return;

    if (data.dots.length >= maxDots)
      return message.error(`You can add max ${maxDots} dots.`);

    let points = { x: e.clientX, y: e.clientY + window.scrollY };
    let dotAngle = getAngleFromPoint(points, circlePosition);
    let newDot = getPointFromAngle(circlePosition, dotAngle);

    setData((curr) => ({ ...curr, dots: [...curr.dots, newDot] }));

    // return before adding line for the dot
    if (drawLinesMode) return;

    if (data.dots.length > 0) {
      let linesArr: any[] = [];

      for (let j = 0; j < data.dots.length; j++) {
        linesArr.push({
          x1: data.dots[j].x,
          y1: data.dots[j].y,
          x2: points.x,
          y2: points.y,
        });
      }

      setData((curr) => ({
        ...curr,
        lines: [...curr.lines, ...reducesLines(linesArr)],
      }));
    }
  };

  const handleAddNumber = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (!allowCountRegions || placementLocked) return;

    if (getDistance(circlePosition, { x: e.clientX, y: e.clientY }) < 175) {
      setData((curr) => ({
        ...curr,
        count: [...curr.count, { x: e.clientX, y: e.clientY }],
      }));
    }
  };

  // e.g., if totalDots is 5, it'll return preloaded data for 5 dots
  const generateDataFromAngle = (totalDots: number) => {
    let dataToReturn = { ...DataInitalState };

    if (totalDots > 1) {
      let dots = [];
      let lines = [];

      for (let i = 1; i <= totalDots; i++) {
        dots.push(getPointFromAngle(circlePosition, (360 / totalDots) * i));
      }

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        for (let j = 1; j < dots.length; j++) {
          if (i === j) continue;
          lines.push({
            x1: dots[j].x,
            y1: dots[j].y,
            x2: dot.x,
            y2: dot.y,
          });
        }
      }

      return { ...dataToReturn, dots, lines: reducesLines(lines) };
    } else {
      return {
        ...dataToReturn,
        dots: [getPointFromAngle(circlePosition, -180)],
      };
    }
  };

  const createIntersections = () => {
    if (data.lines.length > 2) {
      let intersections: any[] = [];
      let intersectingPairs = [];

      for (let i = 0; i < data.lines.length; i++) {
        const line = data.lines[i];
        let lineIntersections = 0;

        for (let j = 0; j < data.lines.length; j++) {
          if (i === j) continue;

          const otherLine = data.lines[j];

          if (
            intersectingPairs.filter(
              (pair) =>
                (compareLine(pair.line1, line) &&
                  compareLine(pair.line2, otherLine)) ||
                (compareLine(pair.line2, line) &&
                  compareLine(pair.line1, otherLine))
            ).length > 0
          ) {
            continue;
          }

          let point = getIntersection(
            { x: line.x1, y: line.y1 },
            { x: line.x2, y: line.y2 },
            { x: otherLine.x1, y: otherLine.y1 },
            { x: otherLine.x2, y: otherLine.y2 }
          );
          if (
            !!point &&
            data.dots.filter(
              (item: any) =>
                Math.floor(item.x) === Math.floor(point?.x) &&
                Math.floor(item.y) === Math.floor(point?.y)
            ).length === 0
          ) {
            intersectingPairs.push({
              line1: line,
              line2: otherLine,
            });

            intersections.push(point);
            lineIntersections += 1;
          }
        }
      }

      setData((curr) => ({ ...curr, intersectngDots: intersections }));
    }
  };

  const createLine = (e: any) => {
    let totalDots = data?.dots?.length;
    let possibleLines = layoutsUnedited?.[totalDots - 1]?.lines?.length;

    if (possibleLines === data.lines?.length) return;

    let startPoints = data.dots[activeIndex];
    let endPoints = {
      x: e.clientX,
      y: e.clientY,
    };
    if (getDistance(circlePosition, endPoints) > 180) {
      endPoints = getPointFromAngle(
        circlePosition,
        getAngleFromPoint(endPoints, circlePosition)
      );
    }

    setLineInMaking({
      x1: startPoints.x,
      y1: startPoints.y,
      x2: endPoints.x,
      y2: endPoints.y,
    });
  };

  const handleClickUpInDrawMode = () => {
    if (drawLinesMode && !!lineInMaking?.x2) {
      for (let i = 0; i < data.dots.length; i++) {
        const dot = data.dots[i];
        if (
          getDistance(dot, { x: lineInMaking.x2, y: lineInMaking.y2 }) <= 10
        ) {
          setData((curr) => {
            return {
              ...curr,
              lines: [...curr.lines, { ...lineInMaking, x2: dot.x, y2: dot.y }],
            };
          });
          setLineInMaking({});
        }
      }
    } else {
      setLineInMaking({});
    }
  };

  const calculateOverlappingRegions = () => {
    if (data.dots.length >= 6) {
      let overlappingDots: any[] = [];
      let overlappingDotsCount = 0;

      for (let i = 0; i < data.intersectngDots.length; i++) {
        const dot = data.intersectngDots[i];

        if (
          overlappingDots.findIndex(
            (item) => compareDots(item, dot) || getDistance(dot, item) < 5
          ) !== -1
        )
          continue;

        if (
          data.intersectngDots.filter(
            (otherDot) => getDistance(dot, otherDot) < 5
          ).length > 2
        ) {
          overlappingDotsCount +=
            data.intersectngDots.filter(
              (otherDot) => getDistance(dot, otherDot) < 5
            ).length - 1;
          overlappingDots.push({
            x: Math.floor(dot.x),
            y: Math.floor(dot.y),
          });
        }
      }

      // This is number of more than 3 overlapping dots
      setCanceledIntersection(overlappingDotsCount);
      setOverlappingRegions(overlappingDots.length);
    }
  };

  //   Dot Functions / Event Handlers --->
  const handleDotMouseDown = (index: number) => () => {
    setMouseEntered(true);
    setActiveIndex(index);
  };

  const handleDotMouseUp = () => {
    setMouseEntered(false);
    setActiveIndex(null);
    handleRefreshCircle();
    handleClickUpInDrawMode();
  };
  //   <--- Dot Functions / Event Handlers

  //   Wrapper Event Handlers --->
  const handleWrapperMouseMove = (e: any) => {
    if (mouseEntered) {
      if (drawLinesMode) return createLine(e);

      let movedPoints = { x: e.clientX, y: e.clientY };

      setData((curr) => {
        if (getDistance(circlePosition, movedPoints) === 180) {
          curr.dots[activeIndex] = {
            x: e.clientX,
            y: e.clientY,
          };
        } else {
          let points = getPointFromAngle(
            circlePosition,
            getAngleFromPoint(movedPoints, circlePosition)
          );
          curr.dots[activeIndex] = points;
        }
        return { ...curr, dots: [...curr.dots] };
      });
    }
  };

  const handleWrapperClick = () => {
    setMouseEntered(false);
    setActiveIndex(null);
    handleRefreshCircle();
    handleClickUpInDrawMode();
  };
  //   <--- Wrapper Event Handlers

  //   Bottom Menu Event Handlers --->
  const handleResetClick = () => {
    setData(DataInitalState);
  };
  //   <--- Bottom Menu Event Handlers

  // useEffects
  useEffect(() => {
    createIntersections();
  }, [data.lines]);

  useEffect(() => {
    calculateOverlappingRegions();
  }, [data.intersectngDots]);

  useEffect(() => {
    let data = document.getElementById("main-circle")?.getBoundingClientRect();
    let svgContainer = document.getElementById("svg-container");
    setCirclePosition({
      // @ts-ignore
      x: data.left + 180,
      // @ts-ignore
      y: data.top + 180,
      containerWidth: svgContainer?.clientWidth,
    });
  }, [
    document.getElementById("main-circle"),
    document.getElementById("svg-container"),
  ]);

  useEffect(() => {
    window.addEventListener("res", () => {
      window.location.reload();
    });
    return () => {
      window.removeEventListener("resize", () => window.location.reload());
    };
  }, []);

  useEffect(() => {
    if (!!circlePosition) {
      let layoutsData: DataType[] = [];
      for (let i = 1; i <= 10; i++) {
        layoutsData.push(generateDataFromAngle(i));
      }
      setLayouts(layoutsData);
      setLayoutsUnedited(layoutsData);
    }
  }, [circlePosition]);

  useEffect(() => {
    if (settings?.draw_lines_mode !== undefined) {
      setDrawLinesMode(settings.draw_lines_mode.bool_value);
      setShowRegionsCount(settings.show_regions_count.bool_value);
      setShowIntersectionsCount(settings.show_intersections_count.bool_value);
      setShowIntersections(settings.show_intersections.bool_value);
      setPlacementLocked(settings.placement_locked.bool_value);
      setAllowCountRegions(settings.allow_count_regions.bool_value);

      if (settings.reset_data.bool_value) {
        setData(DataInitalState);
        (async () => {
          await supabase
            .from("settings")
            .upsert({ ...settings.reset_data, bool_value: false });
        })();
      }
    }
  }, [settings]);

  return (
    <div
      onMouseMove={handleWrapperMouseMove}
      onClick={handleWrapperClick}
      className={classes.wrapper}
    >
      <svg
        id="svg-container"
        height={Configs.containerHeight}
        width={"100%"}
        style={{ flex: 1, minHeight: Configs.containerHeight }}
      >
        <SvgCircle id="main-circle" r={Configs.circleRadius} strokeWidth="3" />

        <SvgCircle
          r={Configs.circleRadius + 5}
          strokeWidth="3"
          stroke="transparent"
          style={{ cursor: "pointer" }}
          onClick={handleAddDot}
        />
        <SvgCircle
          r={Configs.circleRadius - 10}
          strokeWidth="3"
          stroke="transparent"
          style={{ cursor: "pointer" }}
          onClick={handleAddNumber}
        />

        {data.lines.map((line: any, index: number) => (
          <SvgLine key={index} {...line} strokeWidth={2} />
        ))}

        {!!lineInMaking?.x1 && <SvgLine {...lineInMaking} strokeWidth={2} />}

        {showIntersections &&
          data.intersectngDots.map((dot: any, index: number) => (
            <SvgDot {...dot} r={5} key={index} fill="blue" stroke="blue" />
          ))}

        {data.dots.map((dot: any, index: number) => (
          <SvgDot
            {...dot}
            r={5}
            key={index}
            onMouseDown={handleDotMouseDown(index)}
            onMouseUp={handleDotMouseUp}
          />
        ))}

        {allowCountRegions &&
          data.count.map((dot: any, index: number) => (
            <SvgText
              key={index}
              {...dot}
              style={{ fontSize: 12, cursor: "pointer" }}
            >
              {index + 1}
            </SvgText>
          ))}
      </svg>

      <Flex align="center" className={classes.dotsOptionsWrapper}>
        <>
          <Flex
            justify="center"
            align="center"
            className={classes.dotsOption}
            onClick={() => setMaxDots(9999)}
            style={{
              background: maxDots === 9999 ? "rgba(0,0,0,0.05)" : "unset",
            }}
          >
            Freestyle
          </Flex>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((noOfDots) => (
            <Flex
              justify="center"
              align="center"
              className={classes.dotsOption}
              onClick={() => setMaxDots(noOfDots)}
              style={{
                background: noOfDots === maxDots ? "rgba(0,0,0,0.05)" : "unset",
              }}
            >
              {noOfDots} Dots
            </Flex>
          ))}
        </>
      </Flex>

      <Flex
        justify="center"
        align="center"
        direction="column"
        className={classes.bottomContent}
      >
        <Flex direction="column" justify="center" align="center">
          <h2 className={classes.regionsText}>
            {showRegionsCount
              ? calculateRegion(data.dots.length) - overlappingRegions
              : "—"}{" "}
            Regions
          </h2>
          <span className={classes.intersectionsText}>
            {showIntersectionsCount
              ? data.intersectngDots?.length - canceledIntersection
              : "—"}{" "}
            Intersections
          </span>
        </Flex>

        <Button
          icon={<UndoOutlined />}
          type="text"
          onClick={handleResetClick}
          className={classes.resetButton}
        >
          Reset
        </Button>
      </Flex>
    </div>
  );
}

const useStyle = createUseStyles(({ colors }: Theme) => ({
  dotsOptionsWrapper: {
    overflowX: "auto",
    width: "100vw",
  },
  regionsText: { textAlign: "center", margin: "0 15px", flex: 1 },
  intersectionsText: {
    textAlign: "center",
    margin: "5px 15px 0",
    flex: 1,
    fontSize: 13,
  },
  wrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  dotsOption: {
    height: 50,
    marginLeft: 10,
    minWidth: 70,
    padding: [0, 10],
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 500,

    "&:hover": {
      background: "rgba(0,0,0,0.025) !important",
    },
  },
  bottomContent: { marginTop: 20, padding: 20 },
  resetButton: {
    marginTop: 30,
  },
  "@media (min-width: 1000px)": {
    dotsOptionsWrapper: {
      justifyContent: "center",
    },
  },
}));
