import {
  EyeInvisibleOutlined,
  EyeOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Card, Switch, Typography } from "antd";
import Flex from "CirclePage/Flex";
import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import supabase from "utils/client";

export default function Admin({ settings }: any) {
  const classes = useStyle();
  const [hideData, setHideData] = useState(settings[0]?.value === "true");

  const handleChange = async () => {
    setHideData(!hideData);
    let res = await supabase
      .from("settings")
      .upsert({ ...settings[0], value: "" + !hideData });

    console.log(res);
  };

  useEffect(() => {
    setHideData(settings[0]?.value === "true");
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
        <Flex justify="center" align="center">
          <span style={{ marginRight: 10 }}>Show Data</span>
          <Switch checked={hideData} onChange={handleChange} />
          <span style={{ marginLeft: 10 }}>Hide Data</span>
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
