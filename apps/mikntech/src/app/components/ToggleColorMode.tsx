import PropTypes from 'prop-types';

import IconButton from '@mui/material/IconButton';

import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import ModeNightRoundedIcon from '@mui/icons-material/ModeNightRounded';
import { TODO } from '@the-libs/base-shared';

function ToggleColorMode({ mode, toggleColorMode, ...props }: TODO) {
  return (
    <IconButton
      onClick={toggleColorMode}
      color="primary"
      aria-label="Theme toggle button"
      size="small"
      {...props}
    >
      {mode === 'dark' ? (
        <WbSunnyRoundedIcon fontSize="small" />
      ) : (
        <ModeNightRoundedIcon fontSize="small" />
      )}
    </IconButton>
  );
}

ToggleColorMode.propTypes = {
  mode: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleColorMode: PropTypes.func.isRequired,
};

export default ToggleColorMode;
