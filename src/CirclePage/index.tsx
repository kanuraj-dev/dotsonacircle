import { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Button, message, Modal } from "antd";
import Flex from "./Flex";
import CircleGraph from "./CircleGraph";

import {
  compareDots,
  compareLine,
  getDistance,
  getAngleFromPoint,
  getPointFromAngle,
  getIntersection,
  calculateRegion,
  reducesLines,
} from "./functions";
import { SvgCircle, SvgDot, SvgLine, SvgText } from "./CustomSvgs";
import CircleLayouts from "./CircleLayouts";
import { DataType, DataInitalState } from "./types";

const styles: any = {
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
};

export default function CirclePage({ settings }: any) {
  const [mouseEntered, setMouseEntered] = useState(false);
  const [activeIndex, setActiveIndex] = useState<any>(null);
  const [circlePosition, setCirclePosition] = useState<any>(null);
  const [data, setData] = useState<DataType>(DataInitalState);
  const [loadedLayoutIndex, setLoadedLayoutIndex] = useState<any>(null);
  const [layoutsUnedited, setLayoutsUnedited] = useState<DataType[]>([]);
  const [layouts, setLayouts] = useState<DataType[]>([]);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeDotsCount, setChallengeDotsCount] = useState(0);
  const [lineInMaking, setLineInMaking] = useState<any>({});
  const [hideData, setHideData] = useState(false);
  const [showIntersections, setShowIntersections] = useState(false);
  const [placementLocked, setPlacementLocked] = useState(false);

  const [overlappingRegions, setOverlappingRegions] = useState(0);

  const refreshCircle = () => {
    if (challengeMode) return;

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
      setData(DataInitalState);
    }
  };

  const handleAddDot = (e: any) => {
    e.stopPropagation();

    if (challengeMode || placementLocked) return;

    let points = { x: e.clientX, y: e.clientY + window.scrollY };
    setData((curr) => ({ ...curr, dots: [...curr.dots, points] }));

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

  const handleAddNumber = (e: any) => {
    if (challengeMode || placementLocked) return;

    if (getDistance(circlePosition, { x: e.clientX, y: e.clientY }) < 175) {
      setData((curr) => ({
        ...curr,
        count: [...curr.count, { x: e.clientX, y: e.clientY }],
      }));
    }
  };

  const createIntersectionsAndTriangles = () => {
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

  const handleLoadLayout = (index: number) => {
    setLoadedLayoutIndex(index);
  };

  const handleLineCreation = (e: any) => {
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

  const handleClickUpInChallenge = () => {
    if (challengeMode && !!lineInMaking?.x2) {
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

  const removeOverlappingRegions = () => {
    if (data.dots.length >= 6) {
      let overlappingDots: any[] = [];

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
          overlappingDots.push({
            x: Math.floor(dot.x),
            y: Math.floor(dot.y),
          });
        }
      }

      console.log(overlappingDots);

      // This is number of more than 3 overlapping dots
      setOverlappingRegions(overlappingDots.length);
    }
  };

  useEffect(() => {
    if (!!loadedLayoutIndex) {
      setData({ ...layouts[loadedLayoutIndex] });
    }
  }, [loadedLayoutIndex]);

  useEffect(() => {
    if (!!loadedLayoutIndex) {
      setLayouts((curr) => {
        curr[loadedLayoutIndex] = data;
        return [...curr];
      });
    }
  }, [data]);

  useEffect(() => {
    if (challengeMode) {
      let totalDots = data?.dots?.length;
      let possibleLines = layoutsUnedited?.[totalDots - 1]?.lines?.length;

      if (possibleLines === data.lines?.length) {
        message.destroy();
        message.success(
          "Great! You have successfully completed all the lines."
        );
      }
    }
  }, [data]);

  useEffect(() => {
    createIntersectionsAndTriangles();
  }, [data.lines]);

  useEffect(() => {
    removeOverlappingRegions();
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
    if (challengeMode && layoutsUnedited?.length) {
      setData((curr) => ({
        ...DataInitalState,
        dots: layoutsUnedited?.[challengeDotsCount - 1]?.dots,
      }));
      Modal.info({
        centered: true,
        title: "Challenge Mode",
        content: `Connect the ${challengeDotsCount} dots on the circle to divide the circle in as many regions as possible.`,
      });
    }
  }, [challengeMode, layoutsUnedited]);

  useEffect(() => {
    setHideData(
      settings.find((item: any) => item.key === "hide_data")?.value === "true"
    );
    setChallengeMode(
      settings.find((item: any) => item.key === "challenge_mode")?.value ===
        "true"
    );
    setPlacementLocked(
      settings.find((item: any) => item.key === "placement_locked")?.value ===
        "true"
    );
    setChallengeDotsCount(
      settings.find((item: any) => item.key === "challenge_mode")?.data?.dots ??
        0
    );
    setShowIntersections(
      settings.find((item: any) => item.key === "show_intersections")?.value ===
        "true"
    );
  }, [settings]);

  useEffect(() => {
    window.addEventListener("resize", () => window.location.reload());

    return () => {
      window.removeEventListener("resize", () => window.location.reload());
    };
  }, []);

  //   Dot Functions / Event Handlers --->
  const handleDotMouseDown = (index: number) => () => {
    setMouseEntered(true);
    setActiveIndex(index);
  };

  const handleDotMouseUp = () => {
    setMouseEntered(false);
    setActiveIndex(null);
    refreshCircle();
    handleClickUpInChallenge();
  };
  //   <--- Dot Functions / Event Handlers

  //   Wrapper Event Handlers --->
  const handleWrapperMouseMove = (e: any) => {
    if (mouseEntered) {
      if (challengeMode) return handleLineCreation(e);

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
    refreshCircle();
    handleClickUpInChallenge();
  };
  //   <--- Wrapper Event Handlers

  //   Bottom Menu Event Handlers --->
  const handleResetClick = () => {
    if (!!loadedLayoutIndex) {
      setData(layoutsUnedited[loadedLayoutIndex]);
    } else {
      setData(DataInitalState);
    }
  };
  //   <--- Bottom Menu Event Handlers

  return (
    <div
      onMouseMove={handleWrapperMouseMove}
      onClick={handleWrapperClick}
      style={styles.wrapper}
    >
      <svg
        id="svg-container"
        height={500}
        width={"100%"}
        style={{ flex: 1, minHeight: 500 }}
      >
        <SvgCircle
          id="main-circle"
          r={180}
          strokeWidth="3"
          onClick={handleAddDot}
        />
        <SvgCircle
          r={177}
          strokeWidth="3"
          stroke="transparent"
          style={{ cursor: "pointer" }}
          onClick={handleAddNumber}
        />

        {data.lines.map((line: any, index: number) => (
          <SvgLine key={index} {...line} strokeWidth={2} />
        ))}

        {!!lineInMaking?.x1 && <SvgLine {...lineInMaking} strokeWidth={2} />}

        {data.dots.map((dot: any, index: number) => (
          <SvgDot
            {...dot}
            r={5}
            key={index}
            onMouseDown={handleDotMouseDown(index)}
            onMouseUp={handleDotMouseUp}
          />
        ))}
        {showIntersections &&
          data.intersectngDots.map((dot: any, index: number) => (
            <SvgDot {...dot} r={5} key={index} />
          ))}

        {data.count.map((dot: any, index: number) => (
          <SvgText
            key={index}
            {...dot}
            style={{ fontSize: 12, cursor: "pointer" }}
          >
            {index + 1}
          </SvgText>
        ))}
      </svg>

      {!!circlePosition?.containerWidth && (
        <CircleLayouts
          layouts={layouts}
          onLayoutClick={handleLoadLayout}
          activeLayout={loadedLayoutIndex}
          circlePosition={circlePosition}
        />
      )}

      <Flex justify="center" align="center" style={{ padding: "20px" }}>
        <Flex direction="column" justify="center" align="center">
          <h2 style={styles.regionsText}>
            {hideData ? "—" : calculateRegion(data.dots.length)} Regions
          </h2>
          <span style={styles.intersectionsText}>
            {hideData ? "— " : data.intersectngDots?.length} Intersections
          </span>
        </Flex>
        {/* <Button type="text" icon={<UndoOutlined />} onClick={handleResetClick}>
          Reset
        </Button> */}
      </Flex>
    </div>
  );
}

const useStyle = createUseStyles(({ colors }: Theme) => ({}));
