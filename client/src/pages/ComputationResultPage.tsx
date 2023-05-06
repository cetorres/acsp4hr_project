import { Receipt } from "@mui/icons-material";
import { Box, Paper, InputLabel, Typography, Grid, Chip, Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ComputationReturnType } from "../api/computations/computation";
import Computations from "../api/computations/computations";
import { ComputationRun, ComputationRunStatus } from "../api/computations/computation_run";
import { download_file, download_image } from "../api/util/util";
import EmptyData from "../components/EmptyData";
import FabFixedBottom from "../components/FabFixedBottom";
import FabFixedBottomContainer from "../components/FabFixedBottomContainer";
import MainPageContainer from "../components/MainPageContainer";
import PageLoading from "../components/PageLoading";
import { useComputation } from "../contexts/ComputationContext";
import { EntityLink } from "../components/Common";

export const ComputationResultPage = () => {
  const { getComputationRun, isLoading } = useComputation();
  const { computationRunId } = useParams();
  const [computationRun, setComputationRuns] = useState(null as unknown as ComputationRun | null);
  const [resultImage, setResultImage] = useState(null as unknown as HTMLImageElement | HTMLObjectElement | null);
  const imageRef = useRef(null as unknown as HTMLImageElement | null);
  const pdfRef = useRef(null as unknown as HTMLObjectElement | null);
  const navigate = useNavigate();

  const loadComputationRun = async () => {
    const cr = await getComputationRun(computationRunId);
    setComputationRuns(cr);

    // If there is a result image to load
    if (cr?.__computation__?.returnType != ComputationReturnType.Text
        && cr?.runStatus != ComputationRunStatus.Error) {
      const image = await Computations.getComputationRunResultImage(cr?.id);
      setResultImage(image);
    }
  }

  const handleGoToComputationResults = () => {
    navigate('/my-results')
  };

  useEffect(() => {
    loadComputationRun();
  }, []);

  const handleSaveResults = () => {
    let contents = `======================================================================================
SPDS - COMPUTATION RESULT
======================================================================================
Dataset: ${computationRun?.__request__ ? computationRun?.__request__?.__dataset__?.name : computationRun?.__dataset__?.name}
Computation: ${computationRun?.__computation__?.name}
Variables: ${computationRun?.variables == null || computationRun?.variables == '' ? 'None' : computationRun?.variables}
Status: ${ComputationRunStatus[computationRun?.runStatus ?? ComputationRunStatus.Pending]}
Executed at: ${computationRun?.updatedAt ? new Date(computationRun?.updatedAt)?.toLocaleString() : '-'}
--------------------------------------------------------------------------------------
Results
--------------------------------------------------------------------------------------
${computationRun?.resultText}
======================================================================================
`;

    download_file(contents, 'text/plain;charset=utf-8;', `computation_run_${computationRun?.id}`);

    // If there is a result image to download as well
    if (computationRun?.__computation__?.returnType != ComputationReturnType.Text) {
      if (imageRef?.current?.src) {
        download_image(imageRef?.current?.src ?? '', `computation_run_${computationRun?.id}_result_image.png`);
      } else if (pdfRef?.current?.data) {
        download_image(pdfRef?.current?.data ?? '', `computation_run_${computationRun?.id}_result_image.pdf`);
      }
    }
  };

  const handleImageClick = (image?: HTMLImageElement | HTMLObjectElement | null) => {
    const w = image?.width ? Number(image.width) + 2 : 0;
    const h = image?.height ? Number(image.height) + 2 : 0;
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(image instanceof HTMLImageElement ? image?.src : image?.data, 'plot_image',
      `directories=no,scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=${w},height=${h},top=${top},left=${left}`);
  };
  
  return (
    <MainPageContainer title={`Computation result`}>
			{isLoading() ? (
				<PageLoading />
			) : computationRun == null ? (
				<EmptyData
					title="Computation results not found"
					buttonTitle="Go to Computation results"
					icon={<Receipt />}
					buttonClick={handleGoToComputationResults}
				/>
        ) : (
          <>
            <Box sx={{ marginTop: 3 }}>
              <Paper sx={{ width: "100%", p: "16px" }}>
                <InputLabel>Dataset</InputLabel>
                  {computationRun?.__request__?.__dataset__?.name ?
                    <Link style={EntityLink} to={`/datasets/${computationRun?.__request__?.__dataset__?.id}`}>
                      {computationRun?.__request__?.__dataset__?.name}
                    </Link>
                    :
                    <Link style={EntityLink} to={`/datasets/${computationRun?.__dataset__?.id}`}>
                      {computationRun?.__dataset__?.name}
                    </Link>
                  }
                <InputLabel sx={{mt: 2}}>Computation</InputLabel>
                <Typography>
                  <Link style={EntityLink} to={`/computation/${computationRun?.__computation__?.id}`}>
                  {computationRun?.__computation__?.name}
                  </Link>
                </Typography>
                <InputLabel sx={{mt: 2}}>Variables</InputLabel>
                <Typography>
                  {computationRun?.variables == null || computationRun?.variables == '' ? 'None' : computationRun?.variables}
                </Typography>
                <InputLabel sx={{mt: 2}}>Status</InputLabel>
                {computationRun.runStatus == ComputationRunStatus.Pending ? (
                  <Chip label={ComputationRunStatus[computationRun.runStatus]} color="warning" />
                ) : computationRun.runStatus == ComputationRunStatus.Error ? (
                  <Chip label={ComputationRunStatus[computationRun.runStatus]} color="error" />
                ) : computationRun.runStatus == ComputationRunStatus.Success ? (
                  <Chip label={ComputationRunStatus[computationRun.runStatus]} color="success" />
                ) : computationRun.runStatus == ComputationRunStatus.Running ? (
                  <Chip label={ComputationRunStatus[computationRun.runStatus]} color="info" />
                ) : null}
                <InputLabel sx={{mt: 2}}>Executed at</InputLabel>
                <Typography>
                  {computationRun?.updatedAt ? new Date(computationRun?.updatedAt)?.toLocaleString() : '-'}
                </Typography>
              </Paper>
              
              <Grid container spacing={4} alignItems="flex-start">
                <Grid item md={12} lg={computationRun?.__computation__?.returnType == ComputationReturnType.Text ? 12 : 6}>
                  <Paper sx={{ mt: 4, width: "100%", p: "16px" }}>
                    <InputLabel sx={{ fontWeight: 'bold' }}>Results</InputLabel>
                    <Box sx={{ mt: 2 }}>
                        <pre style={{ whiteSpace: 'pre-wrap'}}>
                        {computationRun?.resultText}    
                      </pre>
                    </Box>
                  </Paper>
                </Grid>
                {computationRun?.__computation__?.returnType != ComputationReturnType.Text ? 
                <Grid item md={12} lg={6}>
                  <Paper sx={{ mt: 4, width: '100%', p: "16px" }}>
                    <InputLabel sx={{ fontWeight: 'bold' }}>Plot</InputLabel>
                    {resultImage instanceof HTMLImageElement && resultImage?.src ?
                    <>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img 
                        title='Click image to open larger'
                        ref={imageRef}
                        src={resultImage?.src}
                        style={{ maxWidth: '640px', cursor: 'pointer' }}
                        onClick={() => handleImageClick(resultImage)}
                        />
                    </Box>
                    <Typography sx={{ mt: 1, textAlign: 'center' }} variant="body2">
                      <Button onClick={() => handleImageClick(resultImage)}>Click to open larger</Button>
                    </Typography>
                    </>
                    : resultImage instanceof HTMLObjectElement && resultImage?.data ?
                    <>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <object 
                        data={resultImage?.data + '#toolbar=0'}
                        ref={pdfRef}
                        type='application/pdf' 
                        style={{minWidth: '440px', maxWidth: '640px', width: '100%', height: '500px'}}
                        />
                    </Box>
                    <Typography sx={{ mt: 1, textAlign: 'center' }} variant="body2">
                      <Button onClick={() => handleImageClick(resultImage)}>Click to open larger</Button>
                    </Typography>
                    </> :
                    'No plot image available.'
                    }
                  </Paper>
                </Grid> : null
                }
              </Grid>
              
            </Box>
            
            <FabFixedBottomContainer>
              <FabFixedBottom
                  title='Back'
                  color='default'
                  positionRight={210}
                  onClick={() => navigate('/my-results')}
                />
              <FabFixedBottom
                title='Save Results'
                color=''
                onClick={handleSaveResults}
              />
            </FabFixedBottomContainer>
          </>
			)}
		</MainPageContainer>
	);
}