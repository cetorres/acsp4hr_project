import { Calculate, Clear, Favorite, FavoriteBorder, HeartBroken, Outbox, Save, Search } from '@mui/icons-material';
import { AppBar, Box, Button, Chip, Dialog, DialogContent, Grid, IconButton, InputLabel, Paper, Stack, Tab, Tabs, TextField, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Dataset, Variable } from '../api/datasets/dataset';
import EmptyData from '../components/EmptyData';
import MainPageContainer from '../components/MainPageContainer';
import { DataGrid } from '@mui/x-data-grid';
import FabFixedBottom from '../components/FabFixedBottom';
import FabFixedBottomContainer from '../components/FabFixedBottomContainer';
import { SnackBar, SnackBarInfo } from '../components/SnackBar';
import UserInfoCard from '../components/UserInfoCard';
import PageLoading from '../components/PageLoading';
import { useDataset } from '../contexts/DatasetContext';
import { useRequest } from '../contexts/RequestContext';
import CloseIcon from '@mui/icons-material/Close';
import { Request, RequestStatus } from '../api/requests/request';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAuth } from '../contexts/AuthContext';

export default function DatasetPage() {
  const { datasetId } = useParams();
  const { browseDataset, addFavorite, deleteFavorite, isFavorite } = useDataset();
  const { createRequest, isDatasetRequested, deleteRequest } = useRequest();
  const [dataset, setDataset] = useState(null as unknown as Dataset | null);
  const [request, setRequest] = useState(null as unknown as Request | null);
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const navigate = useNavigate();
  const [variables, setVariables] = useState([] as Variable[]);
  const [loading, setLoading] = useState(false);
  const [datasetFavorite, setDatasetFavorite] = useState(false);
  const [datasetRequested, setDatasetRequested] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { authState } = useAuth();
  const variablesColumnsDef = [
    {
      field: 'name',
      headerName: 'Name',
      editable: false,
      minWidth: 200
    },
    {
      field: 'description',
      headerName: 'Description',
      editable: false,
      minWidth: 400
    },
    {
      field: 'type',
      headerName: 'Type',
      editable: false
    }
  ];

  const initialFormData = {
    description: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadDataset = async () => {
    setLoading(true);
    const result = await browseDataset(datasetId);
    setDataset(result);
    setVariables(result?.variables ?? []);
    checkRequested();
    checkFavorite();
    setLoading(false);
  }

  useEffect(() => {
    loadDataset();
  }, []);

  const checkFavorite = async () => {
    const result = await isFavorite(datasetId);
    setDatasetFavorite(result);
  }

  const checkRequested = async () => {
    const requestObj = await isDatasetRequested(parseInt(datasetId!));
    setDatasetRequested(requestObj == null ? false : true);
    setRequest(requestObj);
  }

  const handleGoToDatasets = () => {
    navigate(`/datasets`);
  };

  const handleViewProfile = (id: any) => {
    navigate(`/users/${id}`);
  };

  const handleSendMessage = (id: any) => {
    setSnackBarInfo({
      message: 'Not yet implemented.',
      type: 'warning'
    });
  };

  const handleRequestAccess = async () => {
    if (dataset == null) {
      setSnackBarInfo({
        message: 'Error: No dataset found.',
        type: 'error'
      });
      return;
    }

    const form = document.getElementById('formRequest') as HTMLFormElement;
    if (!form.reportValidity()) return;

    const { description } = formData;

    const newRequest = {
      ownerId: dataset.__user__.id,
      datasetId: dataset.id,
      description: description
    };
    
    const [ message, requestObj ] = await createRequest(newRequest);

    if (message == null) {
      setDatasetRequested(true);
      setRequest(requestObj);
      setFormData(initialFormData);
      setSnackBarInfo({
        message: 'Requested access to dataset.',
        type: 'success'
      });
      handleCloseDialog();
    }
    else {
      setSnackBarInfo({
        message: 'Error: ' + message,
        type: 'error'
      });
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleRunComputation = () => {
    if (request) {
      navigate(`/computation-run/${request?.id}`);
    }
    else {
      navigate(`/computation-run/?datasetId=${dataset?.id}`);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDeleteDialog = () => {
    setDialogDeleteOpen(true);
  };

  const handleCancelRequest = async () => {
    if (request == null) {
      return;
    }

    const message = await deleteRequest(request.id);
    
    if (message == null) {
      setDatasetRequested(false);
      setRequest(null);
      setSnackBarInfo({
        message: 'Request canceled.',
        type: 'success'
      });
    }
    else {
      setSnackBarInfo({
        message: 'Error: ' + message,
        type: 'error'
      });
    }
  };

  const handleAddFavorite = async () => {
    if (datasetFavorite) {
      const message = await deleteFavorite(datasetId);
      if (message == null) {
        setSnackBarInfo({
          message: 'Dataset removed as favorite.',
          type: 'success'
        });
        setDatasetFavorite(false);
      }
      else {
        setSnackBarInfo({
          message: 'Error: ' + message,
          type: 'error'
        });
      }
    }
    else {
      const message = await addFavorite(datasetId);
      if (message == null) {
        setSnackBarInfo({
          message: 'Dataset added as favorite.',
          type: 'success'
        });
        setDatasetFavorite(true);
      }
      else {
        setSnackBarInfo({
          message: 'Error: ' + message,
          type: 'error'
        });
      }
    }
  };

  const canShowRunComputationButton = () => {
    return !dataset?.requiresPermission
      || dataset?.__user__?.id == authState.user?.id
      || request?.status == RequestStatus.Granted;
  };

  return (
    <MainPageContainer title='Dataset'>
      {loading ? <PageLoading /> : dataset == null ?
        <EmptyData
          title='Dataset not found'
          buttonTitle='Go to Datasets'
          icon={<Search />}
          buttonClick={handleGoToDatasets}
        />
        :
        <>
          <Box sx={{ marginTop: 3 }}>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ width: "100%", p: '16px' }}>
                  <TextField
                    margin="dense"
                    id="name"
                    label="Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    value={dataset.name}
                    InputProps={{readOnly: true}}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    margin="dense"
                    id="description"
                    label="Description"
                    type="text"
                    multiline={true}
                    maxRows={4}
                    fullWidth
                    variant="standard"
                    value={dataset.description}
                    InputProps={{readOnly: true}}
                    sx={{ mb: 2 }}
                  />
                  <InputLabel sx={{ fontSize: 12 }}>Keywords</InputLabel>
                  <Stack direction="row" spacing={1} sx={{mt: 1, mb: 1}}>
                    {dataset?.keywords ? dataset?.keywords.split(',').map((k, index) => <Chip key={index} label={k} />) : 'None'}
                  </Stack>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="dense"
                        id="rows"
                        label="Number of rows"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={dataset.rows}
                        InputProps={{readOnly: true}}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="dense"
                        id="variables"
                        label="Number of variables"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={variables?.length}
                        InputProps={{readOnly: true}}
                        />
                      </Grid>
                  </Grid>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="dense"
                        id="createdAt"
                        label="Created at"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={new Date(dataset.createdAt)?.toLocaleString()}
                        InputProps={{readOnly: true}}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        margin="dense"
                        id="updatedAt"
                        label="Updated at"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={new Date(dataset.updatedAt)?.toLocaleString()}
                        InputProps={{readOnly: true}}
                        />
                      </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} justifyContent="center" alignItems="center">
                <UserInfoCard title='Dataset Owner' user={dataset?.__user__} />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop: 4 }}>
            <Tabs value={0}>
              <Tab label="Variables" id='tab-0' aria-controls='simple-tabpanel-0' />
            </Tabs>
          </Box>

          <Box sx={{ width: '100%', }}>
            <DataGrid
              rows={variables}
              columns={variablesColumnsDef}
              pageSize={50}
              autoHeight={true}
              autoPageSize={true}
              checkboxSelection
              disableSelectionOnClick
            />
          </Box>

          <FabFixedBottomContainer>
            <FabFixedBottom
              title='Favorite'
              color='warning'
              paddingX={fullScreen ? 2 : 0}
              positionRight={canShowRunComputationButton() ? fullScreen ? 230 : 275 : fullScreen ? 220 : 260}
              icon={datasetFavorite ? <Favorite sx={{ mr: 1 }} /> :  <FavoriteBorder sx={{ mr: 1 }} />}
              onClick={handleAddFavorite}
            />
            {canShowRunComputationButton() ?
              <FabFixedBottom
                title='Run Computation'
                color='success'
                paddingX={fullScreen ? 2 : 0}
                icon={<Calculate sx={{ mr: 1 }} />}
                onClick={handleRunComputation}
              /> : 
              request?.status == RequestStatus.Pending ?
                <FabFixedBottom
                  title='Cancel Request'
                  color='error'
                  paddingX={fullScreen ? 2 : 0}
                  icon={<Clear sx={{ mr: 1 }} />}
                  onClick={handleOpenDeleteDialog}
                /> :
                <FabFixedBottom
                  title='Request Access'
                  paddingX={fullScreen ? 2 : 0}
                  disabled={datasetRequested}
                  icon={<Outbox sx={{ mr: 1 }} />}
                  onClick={handleOpenDialog}
                />
            }
          </FabFixedBottomContainer>
        </>
      }

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullScreen={fullScreen}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Request Access
            </Typography>
            <Button autoFocus color="inherit" onClick={handleRequestAccess}>
              <Save />
              Send
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Box component="form" id='formRequest'>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  required
                  label="Request description"
                  name="description"
                  multiline
                  minRows={3}
                  sx={{width: 400}}
                  autoFocus={true}
                  variant="standard"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                />
              </Grid>
             </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      <SnackBar
        snackBarInfo={snackBarInfo}
        onCloseSnackbar={() => setSnackBarInfo(null)}
      />

      <ConfirmDialog
        open={dialogDeleteOpen}
        setOpen={setDialogDeleteOpen}
        title='Cancel Request'
        body={`Confirm canceling request?`}
        handleYes={handleCancelRequest}
        handleNo={() => { }}
      />
    </MainPageContainer>
  )
}
