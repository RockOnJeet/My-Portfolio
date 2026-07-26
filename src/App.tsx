import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Portfolio from "@/pages/Portfolio";
import TimeCapsule from "@/pages/time-capsule";
import Spotify from "@/pages/spotify";
import Admin from "@/pages/admin";
import AdminIntegrations from "@/pages/admin/integrations";
import AdminMcp from "@/pages/admin/mcp";
import AdminSite from "@/pages/admin/site";
import AdminLogs from "@/pages/admin/logs";
import AdminSpotifyIntegration from "@/pages/admin/integrations/spotify";
import AdminGitHubIntegration from "@/pages/admin/integrations/github";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/" component={Portfolio} />
          <Route path="/time-capsule" component={TimeCapsule} />
          <Route path="/spotify" component={Spotify} />
          <Route path="/admin" component={Admin} />
          <Route
            path="/admin/integrations/spotify"
            component={AdminSpotifyIntegration}
          />
          <Route
            path="/admin/integrations/github"
            component={AdminGitHubIntegration}
          />
          <Route path="/admin/integrations" component={AdminIntegrations} />
          <Route path="/admin/mcp" component={AdminMcp} />
          <Route path="/admin/site" component={AdminSite} />
          <Route path="/admin/logs" component={AdminLogs} />
          <Route path="/admin/logs" component={AdminLogs} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;