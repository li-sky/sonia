import React from 'react';
import { ListItem } from '@mui/material';
import { NavLink } from 'react-router-dom';

interface CustomNavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const CustomNavLink: React.FC<CustomNavLinkProps> = ({ to, children, onClick }) => {
  return (
    <ListItem
      component={NavLink}
      to={to}
      onClick={onClick}
      className={`
        flex items-center justify-between rounded-lg
        hover:bg-gray-200 transition-all duration-200
        min-h-[56px] text-black no-underline
        hover:text-black no-wrap
      `}
      style={{ color: 'inherit', cursor: 'pointer' }} // Added inline styles
    >
      {children}
    </ListItem>
  );
};