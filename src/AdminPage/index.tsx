import {
  EyeInvisibleOutlined,
  EyeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Card, Divider, Input, Modal, Switch, Typography } from "antd";
import Flex from "CirclePage/Flex";
import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import supabase from "utils/client";

export default function Admin({ settings }: any) {
  const classes = useStyle();
  const [hideData, setHideData] = useState(false);
  const [showIntersections, setShowIntersections] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeDots, setChallengeDots] = useState("0");

  const [startChllngModalOpen, setStartChllngModalOpen] = useState(false);

  const handleHideDataChange = async () => {
    setHideData(!hideData);
    await supabase.from("settings").upsert({
      ...settings.find((item: any) => item.key === "hide_data"),
      value: "" + !hideData,
    });
  };

  const handleShowIntersectionsChange = async () => {
    setShowIntersections(!showIntersections);
    await supabase.from("settings").upsert({
      ...settings.find((item: any) => item.key === "show_intersections"),
      value: "" + !showIntersections,
    });
  };

  const handleChallengeModeChange = async () => {
    if (!challengeMode) {
      setStartChllngModalOpen(true);
    } else {
      await supabase.from("settings").upsert({
        ...settings.find((item: any) => item.key === "challenge_mode"),
        value: "false",
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
      ...settings.find((item: any) => item.key === "challenge_mode"),
      value: "true",
      data: {
        dots: +challengeDots,
      },
    });
  };

  useEffect(() => {
    setHideData(
      settings.find((item: any) => item.key === "hide_data")?.value === "true"
    );
    setChallengeMode(
      settings.find((item: any) => item.key === "challenge_mode")?.value ===
        "true"
    );
    setShowIntersections(
      settings.find((item: any) => item.key === "show_intersections")?.value ===
        "true"
    );
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
        <Flex align="center">
          <span style={{ marginRight: 10 }}>Show Data</span>
          <Switch checked={hideData} onChange={handleHideDataChange} />
          <span style={{ marginLeft: 10 }}>Hide Data</span>
        </Flex>

        <Divider />

        <Flex align="center">
          <span style={{ marginRight: 10 }}>Show Intersections</span>
          <Switch
            checked={showIntersections}
            onChange={handleShowIntersectionsChange}
          />
        </Flex>

        <Divider />

        <Flex align="center">
          <span style={{ marginRight: 10 }}>Challenge Mode</span>
          <Switch
            checked={challengeMode}
            onChange={handleChallengeModeChange}
          />
        </Flex>
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
