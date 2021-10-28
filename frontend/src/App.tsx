import { Route, Switch } from "react-router-dom";

import Home from "pages/Home";
import Header from "components/layout/Header";
import WrongNetworkAlert from "components/layout/WrongNetworkAlert";

function App() {
  return (
    <div>
      <WrongNetworkAlert />
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
