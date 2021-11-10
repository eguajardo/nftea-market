import { Route, Switch } from "react-router-dom";

import Header from "components/layout/Header";
import WrongNetworkAlert from "components/layout/WrongNetworkAlert";
import Register from "pages/Register/Register";
import Explore from "pages/Explore";
import Profile from "pages/Profile/Profile";
import MyCollection from "pages/MyCollection/MyCollection";
import MySponsored from "pages/MySponsored/MySponsored";
import Home from "pages/Home";

function App() {
  return (
    <div className="index-page">
      <WrongNetworkAlert />
      <Header />
      <Switch>
        <Route path="/register/:stallId?">
          <Register />
        </Route>
        <Route path="/collection">
          <MyCollection />
        </Route>
        <Route path="/sponsored">
          <MySponsored />
        </Route>
        <Route path="/explore">
          <Explore />
        </Route>
        <Route path="/:stallId">
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
