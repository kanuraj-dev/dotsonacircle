import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Switch, Typography } from "antd";
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
    <div className={classes.adminPanel}>
      <Button
        type="text"
        icon={hideData ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        onClick={handleChange}
      >
        {hideData ? "Show" : "Hide"} Data
      </Button>
    </div>
  );
}

const useStyle = createUseStyles(({ colors }: Theme) => ({
  adminPanel: {
    padding: 20,
  },
}));
