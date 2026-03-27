import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Favorite as FavoriteIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'react-query';
import { messagesAPI } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, isAuthenticated, logout } = useAuth();
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Get unread message count
  const { data: messageStats } = useQuery(
    'messageStats',
    messagesAPI.getMessageStats,
    {
      enabled: isAuthenticated,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const unreadCount = messageStats?.data?.stats?.unreadMessages || 0;

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/');
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <SearchIcon /> },
    { label: 'Search', path: '/search', icon: <SearchIcon /> },
  ];

  const authenticatedNavItems = [
    { label: 'Create Listing', path: '/create-listing', icon: <AddIcon /> },
    { label: 'My Listings', path: '/my-listings', icon: <ViewListIcon /> },
    { label: 'Favorites', path: '/favorites', icon: <FavoriteIcon /> },
    { label: 'Messages', path: '/messages', icon: <MessageIcon />, badge: unreadCount },
  ];

  const profileMenuItems = [
    { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
    { label: 'My Listings', path: '/my-listings', icon: <ViewListIcon /> },
    { label: 'Favorites', path: '/favorites', icon: <FavoriteIcon /> },
    { label: 'Messages', path: '/messages', icon: <MessageIcon /> },
  ];

  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={handleMobileDrawerToggle}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Campus Marketplace
        </Typography>
      </Box>
      <Divider />
      
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.path}
            button
            component={Link}
            to={item.path}
            onClick={handleMobileDrawerToggle}
            sx={{
              backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent',
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            {authenticatedNavItems.map((item) => (
              <ListItem
                key={item.path}
                button
                component={Link}
                to={item.path}
                onClick={handleMobileDrawerToggle}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent',
                }}
              >
                <ListItemIcon>
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
        
        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <ListItem button component={Link} to="/login" onClick={handleMobileDrawerToggle}>
              <ListItemIcon>
                <AccountIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={Link} to="/register" onClick={handleMobileDrawerToggle}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItem>
          </>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              textDecoration: 'none',
              color: 'primary.main',
              fontWeight: 'bold',
              mr: 4,
            }}
          >
            Campus Marketplace
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{
                    backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent',
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              {isAuthenticated && (
                <>
                  <Button
                    component={Link}
                    to="/create-listing"
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ ml: 2 }}
                  >
                    Sell Item
                  </Button>
                </>
              )}
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isAuthenticated ? (
                <>
                  <IconButton
                    component={Link}
                    to="/favorites"
                    color="inherit"
                  >
                    <FavoriteIcon />
                  </IconButton>
                  
                  <IconButton
                    component={Link}
                    to="/messages"
                    color="inherit"
                  >
                    <Badge badgeContent={unreadCount} color="error">
                      <MessageIcon />
                    </Badge>
                  </IconButton>
                  
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    {user?.avatar?.url ? (
                      <Avatar
                        src={user.avatar.url}
                        alt={user.fullName}
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {user?.firstName?.[0]}
                      </Avatar>
                    )}
                  </IconButton>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" color="inherit">
                    Login
                  </Button>
                  <Button 
                    component={Link} 
                    to="/register" 
                    variant="contained"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {user?.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        {profileMenuItems.map((item) => (
          <MenuItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleMenuClose}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {item.icon}
              {item.label}
            </Box>
          </MenuItem>
        ))}
        
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LogoutIcon />
            Logout
          </Box>
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      {isMobile && <MobileDrawer />}
    </>
  );
};

export default Navbar;