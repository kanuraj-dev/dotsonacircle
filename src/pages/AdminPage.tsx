import React, { useEffect, useState } from "react";
import { SettingOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Switch } from "antd";
import { createUseStyles } from "react-jss";
import Flex from "components/Flex";
import supabase from "utils/client";

export default function Admin({ settings }: any) {
  const classes = useStyle();
  const [showRegionsCount, setShowRegionsCount] = useState(false);
  const [showIntersectionsCount, setShowIntersectionsCount] = useState(false);
  const [showIntersections, setShowIntersections] = useState(false);
  const [placementLocked, setPlacementLocked] = useState(false);
  const [allowCountRegions, setAllowCountRegions] = useState(false);
  const [drawLinesMode, setDrawLinesMode] = useState(false);

  const handleChange =
    (key: string, state: boolean, setState: (val: boolean) => void) =>
    async () => {
      setState(!state);
      await supabase.from("settings").upsert({
        ...settings[key],
        bool_value: !state,
      });
    };

  const handleLinesModeChange = async () => {
    setDrawLinesMode(!drawLinesMode);
    console.log(settings, settings.draw_lines_mode);
    await supabase.from("settings").upsert({
      ...settings.draw_lines_mode,
      bool_value: !drawLinesMode,
    });
  };

  const handleShowIntersectionsCountChange = async () => {
    setShowIntersectionsCount(!showIntersectionsCount);
    await supabase.from("settings").upsert({
      ...settings.show_intersections_count,
      bool_value: !showIntersectionsCount,
    });
  };

  const handleShowRegionsCountChange = async () => {
    setShowRegionsCount((curr) => !curr);
    console.log(showRegionsCount);
    await supabase.from("settings").upsert({
      ...settings.show_regions_count,
      bool_value: !showRegionsCount,
    });
  };

  const handleShowIntersectionsChange = async () => {
    setShowIntersections(!showIntersections);
    await supabase.from("settings").upsert({
      ...settings.show_intersections,
      bool_value: !showIntersections,
    });
  };

  const handleAllowCountRegionsChange = async () => {
    setAllowCountRegions(!allowCountRegions);
    await supabase.from("settings").upsert({
      ...settings.allow_count_regions,
      bool_value: !allowCountRegions,
    });
  };

  const handleLockPlacementChange = async () => {
    setPlacementLocked(!placementLocked);
    await supabase.from("settings").upsert({
      ...settings.placement_locked,
      bool_value: !placementLocked,
    });
  };

  const handleResetCircles = async () => {
    await supabase.from("settings").upsert({
      ...settings.reset_data,
      bool_value: true,
    });
  };

  useEffect(() => {
    if (settings?.draw_lines_mode !== undefined) {
      setDrawLinesMode(settings.draw_lines_mode.bool_value);
      setShowRegionsCount(settings.show_regions_count.bool_value);
      setShowIntersectionsCount(settings.show_intersections_count.bool_value);
      setShowIntersections(settings.show_intersections.bool_value);
      setPlacementLocked(settings.placement_locked.bool_value);
      setAllowCountRegions(settings.allow_count_regions.bool_value);
    }
  }, [settings]);

  return (
    <Flex justify="center" align="center" className={classes.adminPanel}>
      <Card
        title={
          <Flex justify="center" align="center">
            <SettingOutlined />
            <span style={{ marginLeft: 8 }}>Settings</span>
          </Flex>
        }
      >
        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Automatic Lines</span>
          <Switch
            checked={drawLinesMode}
            onChange={handleChange(
              "draw_lines_mode",
              drawLinesMode,
              setDrawLinesMode
            )}
          />
          <span style={{ marginLeft: 10 }}>Draw Lines</span>
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Show Regions Count</span>
          <Switch
            checked={showRegionsCount}
            onChange={handleChange(
              "show_regions_count",
              showRegionsCount,
              setShowRegionsCount
            )}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Show Intersections Count</span>
          <Switch
            checked={showIntersectionsCount}
            onChange={handleChange(
              "show_intersections_count",
              showIntersectionsCount,
              setShowIntersectionsCount
            )}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Show Intersections</span>
          <Switch
            checked={showIntersections}
            onChange={handleChange(
              "show_intersections",
              showIntersections,
              setShowIntersections
            )}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Allow Count Regions</span>
          <Switch
            checked={allowCountRegions}
            onChange={handleChange(
              "allow_count_regions",
              allowCountRegions,
              setAllowCountRegions
            )}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Lock Placement</span>
          <Switch
            checked={placementLocked}
            onChange={handleChange(
              "placement_locked",
              placementLocked,
              setPlacementLocked
            )}
          />
        </Flex>

        <Divider />

        <Button icon={<UndoOutlined />} onClick={handleResetCircles}>
          Reset Circles
        </Button>
      </Card>
    </Flex>
  );
}

const useStyle = createUseStyles(({ colors }: Theme) => ({
  adminPanel: {
    padding: 20,
    minHeight: "100vh",
    backgroundColor: "aliceblue",
  },
}));
