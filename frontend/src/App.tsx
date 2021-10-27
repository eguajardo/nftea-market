import { Route, Switch } from "react-router-dom";

import Home from "pages/Home";
import Header from "components/layout/Header";

function App() {
  return (
    <div>
      <Header />
      <Switch>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
