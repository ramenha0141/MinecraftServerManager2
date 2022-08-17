import { Check as CheckIcon } from '@mui/icons-material';
import { Autocomplete, Box, Button, Checkbox, CircularProgress, FormControlLabel, TextField, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ForgeVersion, Version } from './API';
import { profilesState } from './states';

const versions: Version[] = ['1.19.2', '1.19', '1.18.2', '1.17.1', '1.16.5', '1.15.2', '1.14.4', '1.13.2', '1.12.2'];

const Setup = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const profiles = useAtomValue(profilesState);
    const [version, setVersion] = useState<Version>(versions[0]);
    const [eulaChecked, setEulaChecked] = useState(false);
    const [installState, setInstallState] = useState<'download' | 'install' | 'complete'>();
    const install = async () => {
        if (!isForge(version)) window.api.installVanilla(profiles[id!].path, version);
        setInstallState('download');
        await window.api.getDownloadState();
        setInstallState('install');
        await window.api.getInstallState();
        setInstallState('complete');
    };
    if (!id) {
        navigate('/');
        return null;
    }
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
                セットアップ
            </Typography>
            {!installState ? (
                <>
                    <Autocomplete
                        disableClearable
                        disablePortal
                        options={versions}
                        value={version}
                        onChange={(_, version) => setVersion(version)}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label='バージョン' />}
                    ></Autocomplete>
                    <FormControlLabel
                        control={<Checkbox checked={eulaChecked} onChange={(e) => setEulaChecked(e.target.checked)} />}
                        label={
                            <>
                                <a href='https://aka.ms/MinecraftEULA' target='_blank' style={{ color: 'inherit' }}>
                                    MINECRAFT エンド ユーザー ライセンス条項
                                </a>
                                に同意する
                            </>
                        }
                    />
                    <Button variant='contained' disabled={!eulaChecked} onClick={install}>
                        インストール
                    </Button>
                </>
            ) : (
                <>
                    <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {installState === 'download' && <CircularProgress size={30} />}
                        {(installState === 'install' || installState === 'complete') && <CheckIcon />}
                        ダウンロード
                    </Typography>
                    <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {installState === 'install' && <CircularProgress size={30} />}
                        {installState === 'complete' && <CheckIcon />}
                        インストール
                    </Typography>
                    {installState === 'complete' && (
                        <Button variant='contained' sx={{ mt: 1 }}>
                            コンソールへ進む
                        </Button>
                    )}
                </>
            )}
        </Box>
    );
};
export default Setup;

const isForge = (version: Version): version is ForgeVersion => version.startsWith('forge');
