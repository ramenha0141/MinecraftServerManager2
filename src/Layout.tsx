import {
    AppBar,
    Box,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Toolbar,
    Typography
} from '@mui/material';
import { Code as CodeIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import { Suspense, useState } from 'react';
import { useAtomValue } from 'jotai';
import { profilesState } from './states';
import useManageOrSetup from './useManageOrSetup';

const Layout = () => {
    const profiles = useAtomValue(profilesState);
    const [open, setOpen] = useState(false);
    const manageOrSetup = useManageOrSetup();
    const toggleOpen = () => setOpen((open) => !open);
    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <AppBar position='static' sx={{ flexShrink: 0 }}>
                <Toolbar>
                    <IconButton size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }} onClick={toggleOpen}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                        Minecraft Server Manager
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer open={open} onClose={toggleOpen}>
                <List sx={{ flexGrow: 1, width: 240 }} onClick={toggleOpen}>
                    <ListSubheader sx={{ backgroundColor: 'inherit' }}>プロファイル</ListSubheader>
                    {Object.entries(profiles).map(([id, { name, path }]) => (
                        <ListItem key={id} disablePadding>
                            <ListItemButton onClick={() => manageOrSetup(id)}>
                                <ListItemText primary={name} secondary={path} sx={{ textOverflow: 'ellipsis' }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <Divider />
                    <ListItem key='openDevtools' disablePadding>
                        <ListItemButton onClick={() => window.api.openDevtools()}>
                            <ListItemIcon>
                                <CodeIcon />
                            </ListItemIcon>
                            <ListItemText primary='開発者ツールを開く' sx={{ textOverflow: 'ellipsis' }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box
                sx={(theme) => ({
                    flexGrow: 1,
                    backgroundColor: theme.palette.background.default,
                    display: 'flex',
                    flexDirection: 'column'
                })}
            >
                <Outlet />
            </Box>
        </Box>
    );
};
export default Layout;
