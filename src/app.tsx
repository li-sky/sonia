import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import { CustomNavLink } from "./components/customNavLink";
import { routes } from "./routes";
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;
const closedDrawerWidth = 60;

const App = () => {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <Provider store={store}>
            <Router>
                <div className="flex">
                    <Drawer
                        variant="permanent"
                        sx={{
                            width: open ? drawerWidth : closedDrawerWidth,
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: open ? drawerWidth : closedDrawerWidth,
                                boxSizing: 'border-box',
                                transition: theme.transitions.create('width', {
                                    easing: theme.transitions.easing.sharp,
                                    duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
                                }),
                            },
                        }}
                    >
                        <div className="flex items-center justify-start ml-2">
                            <IconButton onClick={toggleDrawer}>
                                {open ? <ChevronLeftIcon /> : <MenuIcon />}
                            </IconButton>
                        </div>
                        <Divider />
                        <div className="mt-2">
                            <div className="mt-4">
                                {routes.map(({ path, title, icon: Icon }) => (
                                    <CustomNavLink to={path} key={path} onClick={() => open && toggleDrawer()}>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center">
                                                <Icon />
                                            </div>
                                            {open && <Typography className="text-right whitespace-nowrap">{title}</Typography>}
                                        </div>
                                    </CustomNavLink>
                                ))}
                            </div>
                        </div>
                    </Drawer>

                    <main style={{ flexGrow: 1, padding: theme.spacing(3)}}>
                        <Routes>
                            {routes.map(({ path, component: Component }) => (
                                <Route path={path} element={<Component />} key={path} />
                            ))}
                        </Routes>
                    </main>
                </div>
            </Router>
        </Provider>
    );
};

const rootElement = document.getElementById('root');
createRoot(rootElement).render(<App />);