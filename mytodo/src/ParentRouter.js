import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import {BrowserRouter, Route} from 'react-router-dom'
import Signup from './auths/signup'
import Login from './auths/login';
import Dashboard from './components/homePage'

function Router() {

  // const {logged} =  useContext(AuthContext);
  // console.log('logged or not : '+logged);

  return ( 
  <BrowserRouter>
  <Route path = "/" exact>
        <Login />
  </Route>
  <Route path="/dashboard" component = {Dashboard} />
  <Route path="/signup" component= {Signup} />
      </BrowserRouter>
  );

}

export default Router;



