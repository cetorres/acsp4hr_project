import { Clear, Refresh } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Request, RequestStatus } from '../api/requests/request';
import { ConfirmDialog } from '../components/ConfirmDialog';
import EmptyData from '../components/EmptyData';
import MainPageContainer from '../components/MainPageContainer';
import PageLoading from '../components/PageLoading';
import { SnackBar, SnackBarInfo } from '../components/SnackBar';
import { useRequest } from '../contexts/RequestContext';

export const MyRequestsPage = () => {
  const { requestState, getMyRequests, deleteRequest, isLoading } = useRequest();
  const navigate = useNavigate();
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null as Request | null);
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const [page, setPage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const rowsPerPage = 20;

  useEffect(() => {
    getMyRequests();
  }, []);

  const reloadData = () => {
    getMyRequests(null, true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleGoToDataset = (id: any) => {
    navigate(`/datasets/${id}`);
  };

  const openDeleteDialog = (request: Request) => {
    setCurrentRequest(request);
    setDialogDeleteOpen(true);
  };

  const handleCancelRequest = async () => {
    if (currentRequest == null) {
      return;
    }

    const message = await deleteRequest(currentRequest.id);
    
    if (message == null) {
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

  const handleStatusFilterChange = async (e: any) => {
    const status = Number(e.target.value);
    if (status == -1) {
      await getMyRequests(null, true);
    }
    else {
      await getMyRequests(status, true);
    }
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (requestState.myRequests?.length ?? 0)) : 0;

  return (
    <MainPageContainer title='Requests sent'>
      {isLoading() ? <PageLoading /> :
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
          <Toolbar sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
              }}>
              <Typography
                component='div'
                sx={{ mr: 2, minWidth: '120px'}}
              >
                Filter by status:
              </Typography>
              <Select
                value={requestState.myRequestsFilter}
                label='Status'
                variant='standard'
                onChange={handleStatusFilterChange}
              >
              <MenuItem value='-1'>All requests</MenuItem>
                {Object.values(RequestStatus).map((value) => {
                return !isNaN(Number(value)) ? <MenuItem key={value} value={value}>{RequestStatus[Number(value)]}</MenuItem> : null;
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
              <Table aria-label="datasets table">
                <TableHead>
                  <TableRow>
                    <TableCell>Dataset</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Created at</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!requestState.myRequests || requestState.myRequests?.length <= 0 ? 
                      <TableRow><TableCell colSpan={isMobile ? 4 : 6}><EmptyData title='No requests' /></TableCell></TableRow> : null}
                  {requestState.myRequests?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => (
                      <TableRow tabIndex={-1} key={request.id} sx={{ cursor: 'pointer' }}>
                        <TableCell onClick={() => handleGoToDataset(request.__dataset__.id)}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ ml: 2 }}>
                              <Typography component="div" variant="inherit">
                                {request.__dataset__?.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell onClick={() => handleGoToDataset(request.__dataset__.id)}>{request.description ?? '-'}</TableCell>
                        <TableCell onClick={() => handleGoToDataset(request.__dataset__.id)}>
                          {request.status == RequestStatus.Pending ? (
                            <Chip label={RequestStatus[request.status]} color="warning" />
                          ) : request.status == RequestStatus.Denied ? (
                            <Chip label={RequestStatus[request.status]} color="error" />
                          ) : (
                            <Chip label={RequestStatus[request.status]} color="success" />
                          )}
                        </TableCell>
                        <TableCell onClick={() => handleGoToDataset(request.__dataset__.id)}>{request.__owner__ ? `${request.__owner__?.firstName} ${request.__owner__?.lastName}` : '-'}</TableCell>
                        <TableCell onClick={() => handleGoToDataset(request.__dataset__.id)}>{request.createdAt ? new Date(request.createdAt)?.toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant='contained'
                            size='small'
                            startIcon={<Clear />}
                            color='error'
                            onClick={() => openDeleteDialog(request)}
                            component="span">
                            Cancel
                          </Button>
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
              count={requestState.myRequests?.length ?? 0}
              rowsPerPageOptions={[rowsPerPage]}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
            />
          </Paper>
        </>
      }

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
  );
}
