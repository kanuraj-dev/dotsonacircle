import { Navigate, Route, Routes } from "react-router-dom";
import CirclePage from "./CirclePage";
import AdminPage from "./AdminPage";
import { useEffect, useState } from "react";
import supabase from "utils/client";

function App() {
  const [settings, setSettings] = useState<any[]>([]);

  const initialize = async () => {
    let settings = await supabase.from("settings").select();

    if (!!settings.data) {
      setSettings(settings.data);
    }

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "settings",
        },
        (payload) => {
          console.log(payload);

          let { key, value } = payload.new;
          setSettings((curr) => {
            let index = curr.findIndex((setting) => setting.key === key);
            if (index > -1) {
              curr[index].value = value;
              return [...curr];
            } else {
              return curr;
            }
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
