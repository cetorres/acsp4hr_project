import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MainPageContainer from "../components/MainPageContainer";
import { SnackBar, SnackBarInfo } from "../components/SnackBar";
import { useRequest } from "../contexts/RequestContext";
import { Request, RequestStatus } from '../api/requests/request';
import { Box, Button, Checkbox, Grid, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Typography } from "@mui/material";
import FabFixedBottom from "../components/FabFixedBottom";
import FabFixedBottomContainer from "../components/FabFixedBottomContainer";
import { useComputation } from "../contexts/ComputationContext";
import { ArrowForwardIos, ArrowBackIos, Search, IntegrationInstructions } from '@mui/icons-material';
import { useDataset } from "../contexts/DatasetContext";
import { Dataset, Variable } from "../api/datasets/dataset";
import { Computation } from "../api/computations/computation";
import { ComputationRunStatus } from "../api/computations/computation_run";
import ReturnTypeIcon from "../components/ReturnTypeIcon";
import EmptyData from "../components/EmptyData";
import { useAuth } from "../contexts/AuthContext";
import { EntityLink } from "../components/Common";

function not(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: readonly number[], b: readonly number[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: readonly number[], b: readonly number[]) {
  return [...a, ...not(b, a)];
}

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ComputationRunPage() {
  const { authState } = useAuth();
  const { requestId } = useParams();
  const query = useQuery();
  const [request, setRequest] = useState(null as unknown as Request | null);
  const [dataset, setDataset] = useState(null as unknown as Dataset | null);
  const [selectedComputationId, setSelectedComputationId] = useState(0);
  const { getRequestToMe } = useRequest();
  const { browseDataset } = useDataset();
  const { computationState, getComputations, createComputationRun, isLoading } = useComputation();
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const navigate = useNavigate();
  const [variables, setVariables] = useState([] as Variable[])
  const [checked, setChecked] = useState<readonly number[]>([]);
  const [availableVariablesIds, setAvailableVariablesIds] = useState<readonly number[]>([]);
  const [selectedVariablesIds, setSelectedVariablesIds] = useState<readonly number[]>([]);
  const [selectedComputation, setSelectedComputation] = useState(null as unknown as Computation | null);
  
  const loadRequest = async (forceUpdate: boolean = false) => {
    if (requestId == null || requestId == undefined || requestId == '0') {
      if (query.get('datasetId') != null && query.get('datasetId') != undefined) {
        const dataset = await browseDataset(query.get('datasetId'));
        const vars = dataset?.variables ?? [];
        setDataset(dataset);
        setVariables(vars);
        setAvailableVariablesIds(vars.map((v) => v.id));
      }
    }
    else {
      const r = await getRequestToMe(requestId, forceUpdate);
      if (r?.status == RequestStatus.Granted) {
        setRequest(r);
        const dataset = await browseDataset(r?.__dataset__.id);
        const vars = dataset?.variables ?? [];
        setDataset(dataset);
        setVariables(vars);
        setAvailableVariablesIds(vars.map((v) => v.id));
      }
    }
  }

  const loadComputations = async () => {
    const [computations, _] = await getComputations();
    setSelectedComputationId(computations ? computations[0].id : 0);
    setSelectedComputation(computations ? computations[0] : null);
  };

  useEffect(() => {
    loadRequest();
    loadComputations();
  }, []);

  const handleCreateComputationRun = async () => {
    // Check for request
    if (request == null && dataset == null) {
      setSnackBarInfo({
        message: `Request or dataset not found.`,
        type: 'error'
      });
      return;
    }

    // Check for computation
    if (selectedComputation == null) {
      setSnackBarInfo({
        message: `Computation not found.`,
        type: 'error'
      });
      return;
    }

    // Check for number of selected variables
    if (selectedVariablesIds.length != (selectedComputation?.numberOfVariables ?? 0)) {
      setSnackBarInfo({
        message: `Number of selected variables different from required.`,
        type: 'error'
      });
      return;
    }
    
    // Prepare variables list
    const selectedVariables = variables.filter((v) => selectedVariablesIds.includes(v.id) );
    const selectedVariablesNames = selectedVariables.map((v) => v.name).join(',');

    const newComputationRun = {
      requestId: request != null ? Number(request?.id) : null,
      datasetId: dataset != null ? Number(dataset?.id) : null,
      computationId: Number(selectedComputation?.id),
      variables: selectedVariablesNames,
      runStatus: ComputationRunStatus.Pending
    };

    const [message, _] = await createComputationRun(newComputationRun);

    if (message == null) {
      setSnackBarInfo({
        message: 'Computation run created successfully.',
        type: 'success'
      });
      navigate('/my-results')
    }
    else {
      setSnackBarInfo({
        message: 'Error: ' + message,
        type: 'error'
      });
    }
  };

  // Variables list methods ----------------------
  const leftChecked = intersection(checked, availableVariablesIds);
  const rightChecked = intersection(checked, selectedVariablesIds);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleCheckedRight = () => {
    setSelectedVariablesIds(selectedVariablesIds.concat(leftChecked));
    setAvailableVariablesIds(not(availableVariablesIds, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setAvailableVariablesIds(availableVariablesIds.concat(rightChecked));
    setSelectedVariablesIds(not(selectedVariablesIds, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const canUserRunComputationForDataset = (userId: number | undefined) => {
    return dataset && userId && (!dataset?.requiresPermission || dataset?.__user__?.id == userId);
  };

  return (
    <MainPageContainer title={`Computation - Run`}>
      {request == null && !canUserRunComputationForDataset(authState?.user?.id) ?
        <EmptyData
          title='Invalid Request/Dataset'
          subtitle='You cannot run computations on this dataset.'
          buttonTitle='Go to Datasets'
          icon={<Search />}
          buttonClick={() => navigate('/datasets')}
        />
        :
        <>
          <Box sx={{ marginTop: 3 }} component="form" id='formComputationRun'>
            <Grid container spacing={6} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ width: "100%", p: '16px' }}>
                  <InputLabel>Dataset</InputLabel>
                  <Link style={EntityLink} to={`/datasets/${dataset?.id}`}>
                    {dataset?.name}
                  </Link>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} justifyContent="center" alignItems="center">
                <Paper sx={{ width: "100%", p: '16px' }}>
                  <Grid container>
                    <Grid item xs={6}>
                      <InputLabel id="computation-label">Computation</InputLabel>
                    </Grid>
                    <Grid item xs={6}>
                      <Button size="small" sx={{float: 'right'}} onClick={() => navigate(`/computation/${selectedComputation?.id}`)}><IntegrationInstructions color='info' sx={{verticalAlign: 'top'}} /> View Script</Button>
                    </Grid>
                  </Grid>
                  {isLoading() || selectedComputationId == 0 ? null :
                    <Select
                      labelId="computation-label"
                      required
                      variant='standard'
                      fullWidth
                      sx={{ my: 2 }}
                      margin='dense'
                      id="computation"
                      value={selectedComputationId}
                      label="Computation"
                      onChange={(e) => {
                        setSelectedComputationId(Number(e.target.value));
                        setSelectedComputation(computationState?.computations?.find((f) => f.id == Number(e.target.value)) ?? null);
                      }}
                    >
                      {computationState?.computations?.map((computation) => (
                        <MenuItem key={computation.id} value={computation.id}>{computation.name}</MenuItem>
                      ))}
                    </Select>
                  }
                  <InputLabel sx={{ mt: 1 }}>Description</InputLabel>
                  <Typography variant='subtitle2'>
                    {selectedComputation ? selectedComputation.description : ''}
                  </Typography>
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item>
                      <InputLabel>Required Variables</InputLabel>
                      <Typography variant='subtitle2'>
                        {selectedComputation ? selectedComputation.numberOfVariables : ''}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <InputLabel>Return Type</InputLabel>
                      <Typography variant='subtitle2'>
                        <ReturnTypeIcon returnType={selectedComputation?.returnType} showText={true} />
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={6} justifyContent="center" alignItems="center">
              <Grid item xs={12} sm={5}>
                <Paper sx={{ width: "100%", p: '16px' }}>
                  <InputLabel>Dataset Variables ({availableVariablesIds?.length})</InputLabel>
                  <List
                    sx={{
                      height: 300,
                      bgcolor: 'background.paper',
                      overflow: 'auto',
                    }}
                    dense
                    component="div"
                    role="list"
                  >
                    {availableVariablesIds.map((variableId) => {
                      const labelId = `transfer-list-all-item-${variableId}-label`;

                      return (
                        <ListItemButton
                          key={variableId}
                          role="listitem"
                          onClick={handleToggle(variableId)}
                        >
                          <ListItemIcon>
                            <Checkbox
                              checked={checked.indexOf(variableId) !== -1}
                              tabIndex={-1}
                              disableRipple
                              inputProps={{
                                'aria-labelledby': labelId,
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText id={labelId}
                            primary={variables.find((v) => v.id == variableId)?.name}
                            secondary={variables.find((v) => v.id == variableId)?.type} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Grid container direction="column" alignItems="center">
                  <Button
                    sx={{ my: 0.5 }}
                    variant="outlined"
                    size="small"
                    onClick={handleCheckedRight}
                    disabled={leftChecked.length === 0}
                    aria-label="move selected right"
                  >
                    <ArrowForwardIos />
                  </Button>
                  <Button
                    sx={{ my: 0.5 }}
                    variant="outlined"
                    size="small"
                    onClick={handleCheckedLeft}
                    disabled={rightChecked.length === 0}
                    aria-label="move selected left"
                  >
                    <ArrowBackIos />
                  </Button>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={5}>
                <Paper sx={{ width: "100%", p: '16px' }}>
                  <InputLabel>Selected Variables ({selectedVariablesIds?.length})</InputLabel>
                  <List
                    sx={{
                      height: 300,
                      bgcolor: 'background.paper',
                      overflow: 'auto',
                    }}
                    dense
                    component="div"
                    role="list"
                  >
                    {selectedVariablesIds.map((variableId) => {
                      const labelId = `transfer-list-all-item-${variableId}-label`;

                      return (
                        <ListItemButton
                          key={variableId}
                          role="listitem"
                          onClick={handleToggle(variableId)}
                        >
                          <ListItemIcon>
                            <Checkbox
                              checked={checked.indexOf(variableId) !== -1}
                              tabIndex={-1}
                              disableRipple
                              inputProps={{
                                'aria-labelledby': labelId,
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText id={labelId}
                            primary={variables.find((v) => v.id == variableId)?.name}
                            secondary={variables.find((v) => v.id == variableId)?.type} />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <FabFixedBottomContainer>
            <FabFixedBottom
                  title='Back'
                  color='default'
                  positionRight={240}
                  onClick={() => navigate(-1)}
                />
            <FabFixedBottom
              title='Run Computation'
              onClick={handleCreateComputationRun}
            />
          </FabFixedBottomContainer>
        </>
      }
        
      <SnackBar
        snackBarInfo={snackBarInfo}
        onCloseSnackbar={() => setSnackBarInfo(null)}
      />
    </MainPageContainer>
  );
}