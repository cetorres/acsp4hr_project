import * as React from 'react';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { WbSunny } from '@mui/icons-material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { Divider, Tooltip } from '@mui/material';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import logo from '/top_icon.png'; 

export default function Navbar(props: any) {
  const { darkModeState, toggleDarkMode } = useDarkMode();
  const { authState, authLogout } = useAuth();
  const navigate = useNavigate();
  const { getNotifications } = useNotification();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMyProfile = () => {
    handleMenuClose();
    navigate('/account');
  }

  const handleLogOut = async () => {
    await authLogout()
    handleMenuClose();
    navigate('/auth/signin');
  }

  const menuId = 'primary-search-account-menu';

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={props.handleDrawerToggle}
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Tooltip title="Secure and Privacy-Preserving Data Sharing for Data Science Computations">
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ cursor: 'pointer'}}
            >
              <img src={logo} width="26" style={{ verticalAlign: 'text-bottom', marginRight: 4 }} /> SPDS
            </Typography>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <Tooltip title="Toggle dark and light mode">
              <IconButton
                size="large"
                aria-label="Toggle Dark Mode"
                color="inherit"
                onClick={() => toggleDarkMode()}
              >
                {darkModeState.darkMode ? <WbSunny /> : <DarkModeIcon /> }
              </IconButton>
            </Tooltip>
            <Tooltip title={`You have ${getNotifications()} pending requests`}>
              <IconButton
                size="large"
                aria-label="notifications"
                color="inherit"
                onClick={() => {
                  navigate('/requests');
                }}
              >
                <Badge badgeContent={getNotifications()} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Open user settings">
              <IconButton
                size="large"
                edge="end"
                aria-label="User's account"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                sx={{"&:hover": { background: "transparent" }}}
              >
                <AccountCircle />
                <Typography sx={{ml: 1}} display={{xs: 'none', sm: 'block'}}>
                  {authState.user?.firstName} {authState.user?.lastName}
                </Typography>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        id={menuId}
        keepMounted
        open={isMenuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem disabled sx={{ display: { sm: 'none' } }}>
          {authState.user?.firstName} {authState.user?.lastName}
        </MenuItem>
        <Divider sx={{ display: { sm: 'none' } }} />
        <MenuItem onClick={handleMyProfile}>My account</MenuItem>
        <MenuItem onClick={handleLogOut}>Log out</MenuItem>
      </Menu>
    </>
  );
}
