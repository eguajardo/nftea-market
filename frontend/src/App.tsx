import { Route, Switch } from "react-router-dom";

import Header from "components/layout/Header";
import WrongNetworkAlert from "components/layout/WrongNetworkAlert";
import Register from "pages/Register/Register";
import Home from "pages/Home";
import Profile from "pages/Profile";

function App() {
  return (
    <div>
      <WrongNetworkAlert />
      <Header />
      <Switch>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/profile">
          <Profile />
        </Route>
        <Route path="/:user">
          <Profile />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
