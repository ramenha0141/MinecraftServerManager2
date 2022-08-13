import { useMemo } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import {
    createTheme,
    CssBaseline,
    ThemeProvider,
    useMediaQuery
} from '@mui/material';
import Layout from './Layout';

const App = () => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light'
                }
            }),
        [prefersDarkMode]
    );
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <HashRouter>
                <Routes>
                    <Route path='/' element={<Layout />}>
                        <Route index element={<div />}></Route>
                    </Route>
                </Routes>
            </HashRouter>
        </ThemeProvider>
    );
};

export default App;
