import {
  EyeInvisibleOutlined,
  EyeOutlined,
  SettingOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Input, Modal, Switch, Typography } from "antd";
import Flex from "CirclePage/Flex";
import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import supabase from "utils/client";

export default function Admin({ settings }: any) {
  const classes = useStyle();
  const [showRegionsCount, setShowRegionsCount] = useState(false);
  const [showIntersectionsCount, setShowIntersectionsCount] = useState(false);
  const [showIntersections, setShowIntersections] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeDots, setChallengeDots] = useState("0");
  const [placementLocked, setPlacementLocked] = useState(false);
  const [allowCountRegions, setAllowCountRegions] = useState(false);
  const [drawLinesMode, setDrawLinesMode] = useState(false);

  const [startChllngModalOpen, setStartChllngModalOpen] = useState(false);

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

  const handleChallengeModeChange = async () => {
    if (!challengeMode) {
      setStartChllngModalOpen(true);
    } else {
      await supabase.from("settings").upsert({
        ...settings.challenge_mode,
        bool_value: false,
        data: {
          dots: 0,
        },
      });
    }
  };

  const handleChallengeModalOk = async () => {
    setChallengeMode(!challengeMode);
    setStartChllngModalOpen(false);

    await supabase.from("settings").upsert({
      ...settings.challenge_mode,
      bool_value: true,
      data: {
        dots: +challengeDots,
      },
    });
  };

  useEffect(() => {
    if (settings?.draw_lines_mode !== undefined) {
      setDrawLinesMode(settings.draw_lines_mode.bool_value);
      setShowRegionsCount(settings.show_regions_count.bool_value);
      setShowIntersectionsCount(settings.show_intersections_count.bool_value);
      setChallengeMode(settings.challenge_mode.bool_value);
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
        <Modal
          centered
          title="Start Challenge"
          open={startChllngModalOpen}
          onOk={handleChallengeModalOk}
          onCancel={() => setStartChllngModalOpen(false)}
          style={{ maxWidth: 350 }}
        >
          <Input
            value={challengeDots}
            onChange={(e) => setChallengeDots(e.target.value)}
            placeholder="No. of Dots"
          />
        </Modal>

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Automatic Lines</span>
          <Switch checked={drawLinesMode} onChange={handleLinesModeChange} />
          <span style={{ marginLeft: 10 }}>Draw Lines</span>
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Show Regions Count</span>
          <Switch
            checked={showRegionsCount}
            onChange={handleShowRegionsCountChange}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Show Intersections Count</span>
          <Switch
            checked={showIntersectionsCount}
            onChange={handleShowIntersectionsCountChange}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Show Intersections</span>
          <Switch
            checked={showIntersections}
            onChange={handleShowIntersectionsChange}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Allow Count Regions</span>
          <Switch
            checked={allowCountRegions}
            onChange={handleAllowCountRegionsChange}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Lock Placement</span>
          <Switch
            checked={placementLocked}
            onChange={handleLockPlacementChange}
          />
        </Flex>

        <Divider />

        <Flex align="center" justify="space-between">
          <span style={{ marginRight: 10 }}>Challenge Mode</span>
          <Switch
            checked={challengeMode}
            onChange={handleChallengeModeChange}
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
