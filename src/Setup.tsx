import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const Setup = () => {
    const { id } = useParams();
    if (!id) return null;
    return <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}></Box>;
};
export default Setup;
