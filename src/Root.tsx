import App from "./App";
import { ThemeProvider } from "react-jss";
import { BrowserRouter } from "react-router-dom";
import theme from "./theme/jssTheme";
import { ConfigProvider } from "antd";
import antTheme from "theme/antTheme";

export default function Root() {
  return (
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "rgba(212,163,97,1)",
            fontFamily: "'Ubuntu', sans-serif",
          },
        }}
      >
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}
