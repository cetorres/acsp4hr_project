import { AppBar, Box, Button, Chip, Dialog, DialogContent, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import MainPageContainer from '../components/MainPageContainer';
import CloseIcon from '@mui/icons-material/Close';
import { Add, Delete, Save } from '@mui/icons-material';
import { ConfirmDialog } from '../components/ConfirmDialog';
import FabFixedBottom from '../components/FabFixedBottom';
import FabFixedBottomContainer from '../components/FabFixedBottomContainer';
import { SnackBar, SnackBarInfo } from '../components/SnackBar';
import { useComputation } from '../contexts/ComputationContext';
import { Computation, ComputationReturnType } from '../api/computations/computation';
import PageLoading from '../components/PageLoading';
import EmptyData from '../components/EmptyData';
import ReturnTypeIcon from '../components/ReturnTypeIcon';

const rowsPerPage = 10;

export const ComputationsAdminPage = () => {
  const { computationState, getComputations, updateComputation, createComputation, deleteComputation, isLoading } = useComputation();
  const [page, setPage] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [currentComputation, setCurrentComputation] = useState(null as Computation | null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);

  const initialFormData = {
    name: '',
    description: '',
    scriptCommand: '',
    returnType: ComputationReturnType.Text,
    numberOfVariables: 0,
    isActive: false
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadComputations = async (forceUpdate: boolean = false) => {
    getComputations(true, forceUpdate);
  }

  useEffect(() => {
    loadComputations();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleSaveComputation = async () => {
    const form = document.getElementById('formUser') as HTMLFormElement;
    if (!form.reportValidity()) return;

    if (currentComputation) {
      const message = await updateComputation(Number(currentComputation?.id), formData);
    
      if (message == null) {
        setSnackBarInfo({
          message: 'Computation saved successfully.',
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
    }
    else {
      const [message, _] = await createComputation(formData);
    
      if (message == null) {
        setSnackBarInfo({
          message: 'Computation created successfully.',
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
    }
  }

  const handleOpenDialog = (computation: Computation) => {
    setCurrentComputation(computation);
    setFormData({
      name: computation?.name ?? '',
      description: computation?.description ?? '',
      scriptCommand: computation?.scriptCommand ?? '',
      returnType: computation?.returnType ?? ComputationReturnType.Text,
      numberOfVariables: computation?.numberOfVariables ?? 0,
      isActive: computation?.isActive ?? false
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDialogNewComputation = () => {
    setCurrentComputation(null);
    setFormData({ ...initialFormData, isActive: true });
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (computation: Computation) => {
    setCurrentComputation(computation);
    setDialogDeleteOpen(true);
  };

  const handleDelete = async () => {
    const message = await deleteComputation(Number(currentComputation?.id));
    
    if (message == null) {
      setSnackBarInfo({
        message: 'Computation deleted successfully.',
        type: 'success'
      });
    }
    else {
      setSnackBarInfo({
        message: `Error: ${message}`,
        type: 'error'
      });
    }
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (computationState.computationsAdmin?.length ?? 0)) : 0;
  
  return (
    <MainPageContainer title='Computations'>
      {isLoading() ? <PageLoading /> : !computationState.computationsAdmin || computationState.computationsAdmin?.length <= 0 ?
        <EmptyData
          title='No computations'
          subtitle='Get started by creating a new computation'
          buttonTitle='New Computation'
          buttonClick={handleOpenDialogNewComputation}
        /> :
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer sx={fullScreen ? { maxWidth: '87vw' } : {}}>
              <Table aria-label="computations table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Number of Variables</TableCell>
                    <TableCell align='center'>Return Type</TableCell>
                    <TableCell align='center'>Active</TableCell>
                    <TableCell>Created at</TableCell>
                    <TableCell>Updated at</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {computationState.computationsAdmin?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((computation) => (
                      <TableRow tabIndex={-1} key={computation.id} sx={{ cursor: 'pointer' }}>
                        <TableCell onClick={() => handleOpenDialog(computation)}>{computation?.name}</TableCell>
                        <TableCell align="center" onClick={() => handleOpenDialog(computation)}>{computation?.numberOfVariables}</TableCell>
                        <TableCell align="center" onClick={() => handleOpenDialog(computation)}>
                          <ReturnTypeIcon returnType={computation?.returnType} />
                        </TableCell>
                        <TableCell align="center" onClick={() => handleOpenDialog(computation)}>
                          {computation.isActive ? (
                            <Chip label="Active" color="primary" />
                          ) : (
                            <Chip label="Inactive" />
                          )}
                        </TableCell>
                        <TableCell onClick={() => handleOpenDialog(computation)}>{computation.createdAt ? new Date(computation.createdAt)?.toLocaleString() : '-'}</TableCell>
                        <TableCell onClick={() => handleOpenDialog(computation)}>{computation.updatedAt ? new Date(computation.updatedAt)?.toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <IconButton
                            size="large"
                            edge="end"
                            title='Delete Computation'
                            onClick={(e) => handleOpenDeleteDialog(computation)}
                            aria-label="delete computation"
                            sx={{ mr: 2 }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow
                      style={{
                        height: 53 * emptyRows,
                      }}
                    >
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={computationState.computationsAdmin?.length ?? 0}
              rowsPerPageOptions={[rowsPerPage]}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
            />
          </Paper>
        </>
      }

      <FabFixedBottomContainer>
        <FabFixedBottom
          title='New'
          icon={<Add sx={{ mr: 1 }} />}
          onClick={handleOpenDialogNewComputation}
        />
      </FabFixedBottomContainer>

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
              {currentComputation ? 'Computation' : 'New Computation'}
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSaveComputation}>
              <Save sx={{ mr: 1 }} />
              Save
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Box component="form" id='formUser'>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="name"
                  required
                  label="Name"
                  autoFocus={true}
                  type="text"
                  fullWidth
                  variant="standard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  id="description"
                  label="Description"
                  name="description"
                  multiline
                  variant="standard"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  required
                  id="scriptCommand"
                  label="Script Command"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={formData.scriptCommand}
                  onChange={(e) => setFormData({ ...formData, scriptCommand: e.currentTarget.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  required
                  id="numberOfVariables"
                  label="Number of Variables"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={formData.numberOfVariables}
                  onChange={(e) => setFormData({ ...formData, numberOfVariables: Number(e.currentTarget.value) })}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 2, mb: 2 }}>
                <InputLabel id="returnType-label">Return Type</InputLabel>
                <Select
                  labelId="returnType-label"
                  required
                  variant='standard'
                  fullWidth
                  margin='dense'
                  id="returnType"
                  value={formData.returnType}
                  label="Return Type"
                  onChange={(e) => setFormData({ ...formData, returnType: Number(e.target.value) })}
                >
                  <MenuItem value={ComputationReturnType.Text}>{ComputationReturnType[ComputationReturnType.Text]}</MenuItem>
                  <MenuItem value={ComputationReturnType.Graph}>{ComputationReturnType[ComputationReturnType.Graph]}</MenuItem>
                  <MenuItem value={ComputationReturnType.TextAndGraph}>{ComputationReturnType[ComputationReturnType.TextAndGraph]}</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                } label="Active" />
              </Grid>
             
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <SnackBar
        snackBarInfo={snackBarInfo}
        onCloseSnackbar={() => setSnackBarInfo(null)}
      />

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={dialogDeleteOpen}
        setOpen={setDialogDeleteOpen}
        title='Delete'
        body={`Confirm deleting computation "${currentComputation?.name}"?`}
        handleYes={handleDelete}
        handleNo={() => { }}
      />
    </MainPageContainer>
  );
}
