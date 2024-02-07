import { Info, Keyboard, Settings } from '@mui/icons-material';
import * as React from 'react';
import VocalCommandSettingsPage from './components/VocalCommandSettingsPage';

const PageOtherSettings = () => <p>Page 2</p>;
const PageAbout = () => <p>Page 3</p>;

export const routes = [
    { path: '/', component: VocalCommandSettingsPage, title: '语音按键', icon: Keyboard },
    { path: '/pageOtherSettings', component: PageOtherSettings, title: '其他设置', icon: Settings },
    { path: '/pageAbout', component: PageAbout, title: '关于', icon: Info },
  ];