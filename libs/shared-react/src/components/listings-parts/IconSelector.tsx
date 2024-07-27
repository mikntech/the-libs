import React from 'react';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import KitchenIcon from '@mui/icons-material/Kitchen';
import MouseIcon from '@mui/icons-material/Mouse';
import TvIcon from '@mui/icons-material/Tv';
import ComputerIcon from '@mui/icons-material/Computer';
import { SvgIconComponent } from '@mui/icons-material';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import FilterFramesIcon from '@mui/icons-material/FilterFrames';
import WifiIcon from '@mui/icons-material/Wifi';
import ChairSharpIcon from '@mui/icons-material/ChairSharp';
import ChairAltIcon from '@mui/icons-material/ChairAlt';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { createSvgIcon } from '@mui/material/utils';
import LocalParkingIcon from '@mui/icons-material/LocalParking'; 



const HomeIcon = createSvgIcon(
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
    'Home',
  );

type IconMap = {
    [key: string]: SvgIconComponent;
};

const iconMap: IconMap = {
    'Air conditioner': AcUnitIcon,
    'kitchen': KitchenIcon,
    'Mouse': MouseIcon,
    'Computer screen':ComputerIcon,
    'Desktop':DesktopWindowsIcon,
    'Whiteboard':FilterFramesIcon,
    'TV Screen':TvIcon,
    'WiFi':WifiIcon,
    'Work chair':ChairSharpIcon,
    'Guest chair':ChairAltIcon,
    'Keyboard':KeyboardIcon,
    'Parking':LocalParkingIcon
};

interface IconSelectorProps {
    iconName: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ iconName }) => {
    const IconComponent = iconMap[iconName];

    if (!IconComponent) {
        return null; // Or you can return a default icon or an error message
    }

    return <IconComponent color='primary' />;
};

// Air conditioner

// Computer screen

// Desktop

// Work chair

// Guest chair

// Mouse

// TV Screen

// Whiteboard