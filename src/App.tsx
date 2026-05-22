import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Portfolio from "@/pages/Portfolio";
import TimeCapsule from "@/pages/time-capsule";
import Spotify from "@/pages/spotify";

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/" component={Portfolio} />
          <Route path="/time-capsule" component={TimeCapsule} />
          <Route path="/spotify" component={Spotify} />
        </Switch>
      </WouterRouter>
    </TooltipProvider>
  );
}

export default App;
