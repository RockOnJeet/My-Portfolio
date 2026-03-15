import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Portfolio from "@/pages/Portfolio";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Switch>
          <Route path="/" component={Portfolio} />
          <Route component={NotFound} />
        </Switch>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
