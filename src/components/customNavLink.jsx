import * as React from 'react';

import { NavLink, useMatch } from 'react-router-dom';
import { Button } from '@material-tailwind/react';

export const CustomNavLink = ({ to, children }) => {
    const match = useMatch(to);
    return (
        <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
            <Button className={`flex items-center w-full space-x-2 shadow-lg ${match ? 'bg-cyan-700 text-white' : 'bg-white text-black'}`}>
                {children}
            </Button>
        </NavLink>
    );
};