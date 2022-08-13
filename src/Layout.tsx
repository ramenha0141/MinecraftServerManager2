import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <>
            <AppBar position='static'>
                <Toolbar>
                    <IconButton
                        size='large'
                        edge='start'
                        color='inherit'
                        aria-label='menu'
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant='h6'
                        component='div'
                        sx={{ flexGrow: 1 }}
                    >
                        Minecraft Server Manager
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.background.default
                })}
            >
                <Outlet />
            </Box>
        </>
    );
};
export default Layout;
