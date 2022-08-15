import {
    AppBar,
    Box,
    CircularProgress,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListSubheader,
    Toolbar,
    Typography
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { Suspense, useState } from 'react';
import { useAtomValue } from 'jotai';
import { profilesState } from './states';

const Layout = () => {
    const profiles = useAtomValue(profilesState);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
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
                    {Object.entries(profiles).map(([key, { name, path }]) => (
                        <ListItem key={key} disablePadding>
                            <ListItemButton onClick={() => navigate(`/${key}`)}>
                                <ListItemText primary={name} secondary={path} />
                            </ListItemButton>
                        </ListItem>
                    ))}
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
                <Suspense
                    fallback={
                        <CircularProgress
                            color='inherit'
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    }
                >
                    <Outlet />
                </Suspense>
            </Box>
        </Box>
    );
};
export default Layout;
