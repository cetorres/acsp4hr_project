import { Box, Divider, Drawer, IconButton, List, ListSubheader, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import Navbar from "./Navbar";
import { useState } from 'react';
import { Dashboard, People, Search, Favorite, Outbox, Calculate, Receipt, MoveToInbox, TableChart, Assistant } from '@mui/icons-material';
import ListItemLink from './ListItemLink';
import { useAuth } from '../contexts/AuthContext';
import { version, buildNumber, buildDate } from '../../package.json';
import { Copyright } from './Common';

const drawerWidth = 280;

const MainPageContainer = (props: any) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authState } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <div>
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItemLink to="/dashboard" primary="Dashboard" icon={<Dashboard />} />
        </List>
        <List subheader={<ListSubheader>Datasets</ListSubheader>}>
          <ListItemLink to="/datasets" primary="Browse datasets" icon={<Search />} />
          <ListItemLink to="/my-datasets" primary="My datasets" icon={<TableChart />} />
          <ListItemLink to="/favorite-datasets" primary="Favorite datasets" icon={<Favorite />} />
        </List>
        <List subheader={<ListSubheader>Requests</ListSubheader>}>
          <ListItemLink to="/requests" primary="Requests received" icon={<MoveToInbox />} />
          <ListItemLink to="/my-requests" primary="Requests sent" icon={<Outbox />} />
        </List>
        <List subheader={<ListSubheader>Computations</ListSubheader>}>
          <ListItemLink to="/computations" primary="Browse computations" icon={<Calculate />} />
          <ListItemLink to="/my-results" primary="My results" icon={<Receipt />} />
        </List>
        {authState.user?.isAdmin ?
          <>
            <Divider />
            <List subheader={<ListSubheader>Administrator</ListSubheader>}>
              <ListItemLink to="/admin/users" primary="Users" icon={<People />} />
              <ListItemLink to="/admin/computations" primary="Computations" icon={<Calculate />} />
              <ListItemLink to="/admin/suggestions" primary="Suggestions" icon={<Assistant />} />
            </List>
          </> : ''}
        <List sx={!isMobile ? { position: 'absolute', width: '100%', bottom: '1.3rem' } : null}>
          <Typography sx={{ fontSize: '0.75rem' }} variant="body2" color="text.secondary" align="center">
            App version: {version} (build {buildNumber} - {(new Date(buildDate)).toLocaleDateString()})
          </Typography>
          <Copyright sx={{ fontSize: '0.75rem' }} hideAppName={true} />
        </List>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <Drawer
        variant="temporary"
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open={mobileOpen}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        onClose={handleDrawerToggle}
        sx={{
          width: !mobileOpen ? drawerWidth : 0,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: !mobileOpen ? drawerWidth : 0 },
        }}
        open={!mobileOpen}
      >
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.default" : "grey.50",
            height: '100vh'
        }}>
        <Toolbar />
        <Typography
          sx={{ flex: '1 1 100%', borderBottom: '1px solid #CCC', mt: -1, mb: 3, pb: 0.5 }}
          variant="h5"
          component="div"
        >
          {props.title}
          {props.topButton != null ? 
            <IconButton sx={{ py: 0, ml: 3 }} color="primary" onClick={props.topButton.onClick}>
              {props.topButton.icon}
            </IconButton>
            : null
          }
        </Typography>
        {props.children}
        <Box component='div' sx={{paddingBottom: '44px'}}></Box>
      </Box>
    </Box>
  );
}

export default MainPageContainer;