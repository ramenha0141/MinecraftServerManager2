import { Add as AddIcon } from '@mui/icons-material';
import {
    Box,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Paper
} from '@mui/material';
import { useAtom } from 'jotai';
import { profilesState } from './states';

const Home = () => {
    const [profiles, setProfiles] = useAtom(profilesState);
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Box
                sx={{
                    flexGrow: 1,
                    mx: 10,
                    my: 4,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Box
                    sx={{
                        flexShrink: 0,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}
                >
                    <IconButton>
                        <AddIcon />
                    </IconButton>
                </Box>
                <List component={Paper} sx={{ flexGrow: 1 }}>
                    {Object.entries(profiles).map(([key, { name, path }]) => (
                        <ListItem key={key}>
                            <ListItemButton>
                                <ListItemText primary={name} secondary={path} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Box>
    );
};
export default Home;
