import { Delete, Refresh } from '@mui/icons-material';
import { Chip, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComputationRun, ComputationRunStatus } from '../api/computations/computation_run';
import { ConfirmDialog } from '../components/ConfirmDialog';
import EmptyData from '../components/EmptyData';
import MainPageContainer from '../components/MainPageContainer';
import PageLoading from '../components/PageLoading';
import ReturnTypeIcon from '../components/ReturnTypeIcon';
import { SnackBar, SnackBarInfo } from '../components/SnackBar';
import { useComputation } from '../contexts/ComputationContext';

const rowsPerPage = 10;

export const ComputationsResultsPage = () => {
  const { computationState, getComputationRuns, deleteComputationRun, filterComputationRunsLocally, isLoading } = useComputation();
  const [page, setPage] = useState(0);
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [currentComputationRun, setCurrentComputationRun] = useState(null as ComputationRun | null);
  const [statusFilter, setStatusFilter] = useState(-1 as unknown as ComputationRunStatus | Number);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const reloadData = () => {
    setStatusFilter(-1);
    getComputationRuns(true);
  };
  
  useEffect(() => {
    reloadData();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleGoToComputationRun = (id: any, status: ComputationRunStatus) => {
    if (status != ComputationRunStatus.Pending) {
      navigate(`/my-results/${id}`);
    }
  };

  const handleOpenDeleteDialog = (computationRun: ComputationRun) => {
    setCurrentComputationRun(computationRun);
    setDialogDeleteOpen(true);
  };

  const handleDelete = async () => {
    const message = await deleteComputationRun(Number(currentComputationRun?.id));
    
    if (message == null) {
      setSnackBarInfo({
        message: 'Computation result deleted successfully.',
        type: 'success'
      });
    }
    else {
      setSnackBarInfo({
        message: `Error: ${message}`,
        type: 'error'
      });
    }
  };

  const handleStatusFilterChange = (e: any) => {
    const status = Number(e.target.value);
    setStatusFilter(status);
    filterComputationRunsLocally(status);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (computationState.computationRuns?.length ?? 0)) : 0;
  
  return (
    <MainPageContainer title='Computations results'>
      {isLoading() ? <PageLoading /> :
      <>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <Toolbar sx={{
              pl: { sm: 2 },
              pr: { xs: 1, sm: 1 },
            }}>
            <Typography
              component='div'
              sx={{ mr: 2, width: '140px'}}
            >
              Filter by status:
            </Typography>
            <Select
              value={statusFilter}
              label='Status'
              variant='standard'
              onChange={handleStatusFilterChange}
            >
             <MenuItem value='-1'>All results</MenuItem>
              {Object.values(ComputationRunStatus).map((value) => {
               return !isNaN(Number(value)) ? <MenuItem key={value} value={value}>{ComputationRunStatus[Number(value)]}</MenuItem> : null;
              })}
            </Select>
            <Typography sx={{ flex: '1 1 100%' }}></Typography>
            <Tooltip title="Refresh">
              <IconButton onClick={reloadData}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Toolbar>
          <TableContainer sx={isMobile ? { maxWidth: '87vw' } : {}}>
            <Table aria-label="computation runs table">
              <TableHead>
                <TableRow>
                  <TableCell>Dataset</TableCell>
                  <TableCell>Computation</TableCell>
                  <TableCell>Variables</TableCell>
                  <TableCell align='center'>Return Type</TableCell>
                  <TableCell align='center'>Status</TableCell>
                  <TableCell>Created at</TableCell>
                  <TableCell>Updated at</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!computationState.computationRuns || computationState.computationRuns?.length <= 0 ? 
                  <TableRow><TableCell colSpan={isMobile ? 4 : 8}><EmptyData title='No results' /></TableCell></TableRow> : null}
                {computationState.computationRuns?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((computationRun) => (
                    <TableRow tabIndex={-1} key={computationRun.id} sx={{ cursor: 'pointer' }}>
                      <TableCell onClick={() => handleGoToComputationRun(computationRun?.id, computationRun.runStatus)}>{
                        computationRun?.__request__?.__dataset__?.name ? computationRun?.__request__?.__dataset__?.name : computationRun?.__dataset__?.name
                      }</TableCell>
                      <TableCell onClick={() => handleGoToComputationRun(computationRun?.id, computationRun.runStatus)}>{computationRun?.__computation__?.name}</TableCell>
                      <TableCell onClick={() => handleGoToComputationRun(computationRun?.id, computationRun.runStatus)}>
                        {computationRun?.variables && computationRun?.variables != '' ? computationRun?.variables : '－'}
                      </TableCell>
                      <TableCell align="center" onClick={() => handleGoToComputationRun(computationRun?.id, computationRun.runStatus)}>
                        <ReturnTypeIcon returnType={computationRun.__computation__?.returnType} />
                      </TableCell>
                      <TableCell align="center" onClick={() => handleGoToComputationRun(computationRun?.id, computationRun.runStatus)}>
                          {computationRun.runStatus == ComputationRunStatus.Pending ? (
                            <Chip label={ComputationRunStatus[computationRun.runStatus]} color="warning" />
                          ) : computationRun.runStatus == ComputationRunStatus.Error ? (
                            <Chip label={ComputationRunStatus[computationRun.runStatus]} color="error" />
                          ) : computationRun.runStatus == ComputationRunStatus.Success ? (
                            <Chip label={ComputationRunStatus[computationRun.runStatus]} color="success" />
                          ) : computationRun.runStatus == ComputationRunStatus.Running ? (
                            <Chip label={ComputationRunStatus[computationRun.runStatus]} color="info" />
                          ) : null}
                      </TableCell>
                      <TableCell onClick={() => handleGoToComputationRun(computationRun?.id, computationRun.runStatus)}>{computationRun?.createdAt ? new Date(computationRun?.createdAt)?.toLocaleString() : '－'}</TableCell>
                      <TableCell onClick={() => handleGoToComputationRun(computationRun?.id, computationRun.runStatus)}>{computationRun?.updatedAt ? new Date(computationRun?.updatedAt)?.toLocaleString() : '－'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="large"
                          edge="end"
                          title='Delete'
                          onClick={(e) => handleOpenDeleteDialog(computationRun)}
                          aria-label="delete"
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
            count={computationState.computationRuns?.length ?? 0}
            rowsPerPageOptions={[rowsPerPage]}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </Paper>
      </>
    }

    {/* Snackbar */}
    <SnackBar
      snackBarInfo={snackBarInfo}
      onCloseSnackbar={() => setSnackBarInfo(null)}
    />
    
    {/* Confirmation dialog */}
    <ConfirmDialog
        open={dialogDeleteOpen}
        setOpen={setDialogDeleteOpen}
        title='Delete Computation Result'
        body={`Confirm deleting this computation result?`}
        handleYes={handleDelete}
        handleNo={() => { }}
      />
  </MainPageContainer>
  );
}
