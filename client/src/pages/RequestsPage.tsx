import { Check, Clear, Refresh } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Request, RequestStatus } from '../api/requests/request';
import EmptyData from '../components/EmptyData';
import MainPageContainer from '../components/MainPageContainer';
import PageLoading from '../components/PageLoading';
import { SnackBar, SnackBarInfo } from '../components/SnackBar';
import { useRequest } from '../contexts/RequestContext';

export const RequestsPage = () => {
  const { requestState, getRequestsToMe, approveRejectRequest, isLoading } = useRequest();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const rowsPerPage = 20;

  useEffect(() => {
    getRequestsToMe()
  }, []);

  const reloadData = () => {
    getRequestsToMe(null, true);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleGoToRequest = (id: any) => {
    navigate(`/requests/${id}`);
  };

  const handleRequestAccept = async (request: Request) => {
    const data = {
      ownerId: request.__owner__.id,
      status: RequestStatus.Granted,
      requestId: request.id
    };

    const message = await approveRejectRequest(data);
    
    if (message == null) {
      setSnackBarInfo({
        message: 'Request access granted.',
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

  const handleRequestReject = async (request: Request) => {
    const data = {
      ownerId: request.__owner__.id,
      status: RequestStatus.Denied,
      requestId: request.id
    };

    const message = await approveRejectRequest(data);
    
    if (message == null) {
      setSnackBarInfo({
        message: 'Request access denied.',
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

  const handleRequestRevoke = async (request: Request) => {
    const data = {
      ownerId: request.__owner__.id,
      status: RequestStatus.Pending,
      requestId: request.id
    };

    const message = await approveRejectRequest(data);
    
    if (message == null) {
      setSnackBarInfo({
        message: 'Request access revoked.',
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
      await getRequestsToMe(null, true);
    }
    else {
      await getRequestsToMe(status, true);
    }
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (requestState.requestsToMe?.length ?? 0)) : 0;
  
  return (
    <MainPageContainer title='Requests received'>
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
                value={requestState.requestsToMeFilter}
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
                    <TableCell>Requester</TableCell>
                    <TableCell>Created at</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!requestState.requestsToMe || requestState.requestsToMe?.length <= 0 ? 
                    <TableRow><TableCell colSpan={isMobile ? 4 : 6}><EmptyData title='No requests' /></TableCell></TableRow> : null}
                  {requestState.requestsToMe?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((request) => (
                      <TableRow tabIndex={-1} key={request.id} sx={{ cursor: 'pointer' }}>
                        <TableCell onClick={() => handleGoToRequest(request.id)}>
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
                        <TableCell onClick={() => handleGoToRequest(request.id)}>{request.description ?? '-'}</TableCell>
                        <TableCell onClick={() => handleGoToRequest(request.id)}>
                          {request.status == RequestStatus.Pending ? (
                            <Chip label={RequestStatus[request.status]} color="warning" />
                          ) : request.status == RequestStatus.Denied ? (
                            <Chip label={RequestStatus[request.status]} color="error" />
                          ) : (
                            <Chip label={RequestStatus[request.status]} color="success" />
                          )}
                        </TableCell>
                        <TableCell onClick={() => handleGoToRequest(request.id)}>{request.__requester__ ? `${request.__requester__?.firstName} ${request.__requester__?.lastName}` : '-'}</TableCell>
                        <TableCell onClick={() => handleGoToRequest(request.id)}>{request.createdAt ? new Date(request.createdAt)?.toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          {request.status == RequestStatus.Pending ?
                            <>
                            <Button
                              variant='contained'
                              size='small'
                              startIcon={<Check />}
                              color='success'
                              onClick={() => handleRequestAccept(request)}
                              component="span">
                              Grant
                            </Button>
                            <Button
                              variant='contained'
                              size='small'
                              sx={isMobile ? {mt: 2} : {ml: 2}}
                              startIcon={<Clear />}
                              color='error'
                              onClick={() => handleRequestReject(request)}
                              component="span">
                              Reject
                            </Button>
                            </>
                            : 
                            <Button
                              variant='contained'
                              size='small'
                              startIcon={<Clear />}
                              color='warning'
                              onClick={() => handleRequestRevoke(request)}
                              component="span">
                              Revoke
                            </Button>
                            }
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
              count={requestState.requestsToMe?.length ?? 0}
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
    </MainPageContainer>
  );
}
