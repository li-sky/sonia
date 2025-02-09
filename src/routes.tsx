import { Info, Keyboard, Settings, Code } from '@mui/icons-material';
import * as React from 'react';
import VocalCommandSettingsPage from './components/VocalCommandSettingsPage';
import OtherSettingsPage from './components/OtherSettingsPage';
import LoggingPage from './components/LoggingPage';

const PageAbout = () => <p>Page 3</p>;

export const routes = [
    { path: '/', component: VocalCommandSettingsPage, title: '语音按键', icon: Keyboard },
    { path: '/pageOtherSettings', component: OtherSettingsPage, title: '其他设置', icon: Settings },
    { path: '/pageAbout', component: PageAbout, title: '关于', icon: Info },
    { path: '/logging', component: LoggingPage, title: '日志', icon: Code},
  ];