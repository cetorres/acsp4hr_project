import { useNavigate, useParams } from "react-router-dom";
import EmptyData from "../components/EmptyData";
import MainPageContainer from "../components/MainPageContainer";
import PageLoading from "../components/PageLoading";
import { useComputation } from "../contexts/ComputationContext";
import { useEffect, useState } from "react";
import { Computation } from "../api/computations/computation";
import { Calculate } from "@mui/icons-material";
import FabFixedBottomContainer from "../components/FabFixedBottomContainer";
import FabFixedBottom from "../components/FabFixedBottom";
import { Box, Grid, InputLabel, Paper, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material";
import ReturnTypeIcon from "../components/ReturnTypeIcon";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

export const ComputationPage = () => {
  const { getComputation, getComputationScript, isLoading } = useComputation();
  const { computationId } = useParams();
  const [computation, setComputation] = useState(null as unknown as Computation | null);
  const [computationScript, setComputationScript] = useState(null as unknown as string | null);
  const [scriptLanguage, setScriptLanguage] = useState('');
  const [scriptStyle, setScriptStyle] = useState('light' as 'light' | 'dark');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const loadComputation = async () => {
    const comp = await getComputation(computationId);
    const script = await getComputationScript(comp?.id);

    if (comp && comp?.scriptCommand) {
      const command = comp?.scriptCommand.split(' ')[0];
      if (command.toLowerCase().includes('python')) {
        setScriptLanguage('Python');
      } else if (command.toLowerCase().includes('rscript')) {
        setScriptLanguage('R');
      }
    }

    setComputation(comp);
    setComputationScript(script);
  }

  useEffect(() => {
    loadComputation();
  }, []);

  return (
    <MainPageContainer title={'Computation'}>
      {isLoading() ? (
				<PageLoading />
			) : computation == null ? (
				<EmptyData
					title="Computation not found"
					buttonTitle="Go to Computations"
					icon={<Calculate />}
					buttonClick={() => navigate('/computations')}
				/>
        ) : (
          <>
            <Box sx={{ marginTop: 3 }}>
              <Grid container spacing={4} alignItems="flex-start">
                <Grid item md={12} lg={12}>
                  <Paper sx={{ width: "100%", p: "16px" }}>
                    <InputLabel>Name</InputLabel>
                    <Typography>
                      {computation?.name}
                    </Typography>
                    <InputLabel sx={{mt: 2}}>Description</InputLabel>
                    <Typography>
                      {computation?.description}
                    </Typography>
                    <InputLabel sx={{mt: 2}}>Number of variables</InputLabel>
                    <Typography>
                      {computation?.numberOfVariables}
                    </Typography>               
                    <InputLabel sx={{mt: 2}}>Type</InputLabel>
                    <Typography>
                      <ReturnTypeIcon returnType={computation?.returnType} showText={true} />
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item md={12} lg={12}>
                  <Grid container spacing={4} alignItems="flex-start">
                    <Grid item md={12} lg={12}>
                      <Paper sx={{ width: "100%", p: "16px" }}>
                        <Grid container sx={{alignItems: 'center'}}>
                          <Grid item xs={6}>
                            <InputLabel>Script code ({scriptLanguage})</InputLabel>
                          </Grid>
                          <Grid item xs={6} sx={{textAlign: 'right'}}>
                            <ToggleButtonGroup 
                              size='small'
                              onChange={(e, value) => setScriptStyle(value)}
                              value={scriptStyle}
                              exclusive={true}>
                              <ToggleButton value={'light'} key={'light'}>Light</ToggleButton>
                              <ToggleButton value={'dark'} key={'dark'}>Dark</ToggleButton>
                            </ToggleButtonGroup>
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                          <SyntaxHighlighter 
                            customStyle={{maxHeight: '640px', width: isMobile ? '445px' : isTablet ? '720px' : '100%', border: '1px solid #DDD'}}
                            wrapLines={true}
                            wrapLongLines={true}
                            language={scriptLanguage.toLowerCase()} 
                            style={scriptStyle == 'light' ? oneLight : oneDark} 
                            showLineNumbers={true}>
                            {computationScript ?? ''}   
                          </SyntaxHighlighter>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            
            <FabFixedBottomContainer>
              <FabFixedBottom
                  title='Back'
                  color='default'
                  onClick={() => navigate(-1)}
                />
            </FabFixedBottomContainer>
          </>
			)}
    </MainPageContainer>
  );
}