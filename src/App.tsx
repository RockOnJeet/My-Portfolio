import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { FullscreenLoader } from "@/components/ui/fullscreen-loader";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const Portfolio = lazy(() => import("@/pages/Portfolio"));
const TimeCapsule = lazy(() => import("@/pages/time-capsule"));
const Spotify = lazy(() => import("@/pages/spotify"));

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Suspense fallback={<FullscreenLoader />}>
          <Switch>
            <Route path="/" component={Portfolio} />
            <Route path="/time-capsule" component={TimeCapsule} />
            <Route path="/spotify" component={Spotify} />
          </Switch>
        </Suspense>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
