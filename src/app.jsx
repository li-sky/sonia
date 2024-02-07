import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Route, Link, Routes, NavLink, useMatch } from 'react-router-dom';
import { Button, Card, List, Navbar, Typography } from '@material-tailwind/react';
import { Provider } from 'react-redux';
import store from './store/store.ts';
import "@mui/icons-material";


import { routes } from "./routes";

import { CustomNavLink } from "./components/customNavLink.jsx";


const App = () => {
    return (
        <Provider store={store}>
          <Router>
            <div className="flex">
              <Card className="h-full w-full max-w-[18rem] p-4 shadow-xl shadow-blue-gray-900/5">
                <div className="flex flex-col space-y-10">
                  <Typography color="blue" size="lg">菜单</Typography>
                  <List className="flex flex-col space-y-10">
                    {routes.map(({ path, title, icon: Icon }) => (
                      <CustomNavLink to={path} key={path}>
                        <Icon />
                        <Typography>{title}</Typography>
                      </CustomNavLink>
                    ))}
                  </List>
                </div>
              </Card>
              <div className="flex-grow p-4">
                <Routes>
                  {routes.map(({ path, component: Component }) => (
                    <Route path={path} element={<Component />} key={path} />
                  ))}
                </Routes>
              </div>
            </div>
          </Router>
        </Provider>
    );
};

const rootElement = document.getElementById('root');
createRoot(rootElement).render(<App />);