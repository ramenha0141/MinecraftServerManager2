import { PlayArrow as PlayArrowIcon, Stop as StopIcon } from '@mui/icons-material';
import { Box, Button, ButtonGroup, Tab, Tabs } from '@mui/material';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profilesState } from './states';

const TabPanel = (props: { children: JSX.Element; value: number; index: number }) => (props.value === props.index ? props.children : null);

const Manage = () => {
    const { id } = useParams();
    const profiles = useAtomValue(profilesState);
    const [tabIndex, setTabIndex] = useState(0);
    useEffect(() => window.api.openProfile(profiles[id!].path), []);
    if (!id) return null;
    return (
        <Box sx={{ flexGrow: 1, mx: 8, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flexShrink: 0, mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <ButtonGroup variant='contained'>
                    <Button>
                        <PlayArrowIcon />
                    </Button>
                    <Button>
                        <StopIcon />
                    </Button>
                </ButtonGroup>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={(_, tabIndex) => setTabIndex(tabIndex)}>
                    <Tab label='サーバー設定' />
                    <Tab label='バックアップ' />
                    <Tab label='Discord連携' />
                </Tabs>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <TabPanel value={tabIndex} index={0}>
                    <div>a</div>
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                    <div>b</div>
                </TabPanel>
                <TabPanel value={tabIndex} index={2}>
                    <div>c</div>
                </TabPanel>
            </Box>
        </Box>
    );
};
export default Manage;
