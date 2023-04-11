import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import CirclePage from "pages/CirclePage";
import AdminPage from "pages/AdminPage";
import supabase from "utils/client";

function App() {
  const [settings, setSettings] = useState<any>({});

  const initialize = async () => {
    let settings = await supabase.from("settings").select();

    if (!!settings.data) {
      let settingObj: any = {};
      for (let i = 0; i < settings.data.length; i++) {
        const setting = settings.data[i];
        settingObj[setting.key] = setting;
      }
      setSettings(settingObj);
    }

    supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "settings",
        },
        (payload) => {
          let { key, ...values } = payload.new;
          setSettings((curr: any) => {
            curr[key] = { ...curr[key], ...values };
            return { ...curr };
          });
        }
      )
      .subscribe();
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/circle" />} />
        <Route path="/circle" element={<CirclePage settings={settings} />} />
        <Route path="/admin" element={<AdminPage settings={settings} />} />
      </Routes>
    </div>
  );
}

export default App;
