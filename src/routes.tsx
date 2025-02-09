import { Info, Keyboard, Settings } from '@mui/icons-material';
import * as React from 'react';
import VocalCommandSettingsPage from './components/VocalCommandSettingsPage';
import PageOtherSettings from './components/OtherSettingsPage';

const PageAbout = () => <p>Page 3</p>;

export const routes = [
    { path: '/', component: VocalCommandSettingsPage, title: '语音按键', icon: Keyboard },
    { path: '/pageOtherSettings', component: PageOtherSettings, title: '其他设置', icon: Settings },
    { path: '/pageAbout', component: PageAbout, title: '关于', icon: Info },
  ];