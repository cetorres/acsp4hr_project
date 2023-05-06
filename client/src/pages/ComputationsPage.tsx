import { AppBar, Box, Button, Dialog, DialogContent, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import MainPageContainer from '../components/MainPageContainer';
import { SnackBar, SnackBarInfo } from '../components/SnackBar';
import { useComputation } from '../contexts/ComputationContext';
import PageLoading from '../components/PageLoading';
import EmptyData from '../components/EmptyData';
import ReturnTypeIcon from '../components/ReturnTypeIcon';
import { useNavigate } from 'react-router-dom';
import FabFixedBottomContainer from '../components/FabFixedBottomContainer';
import FabFixedBottom from '../components/FabFixedBottom';
import { Add, Save } from '@mui/icons-material';
import Computations from '../api/computations/computations';
import CloseIcon from '@mui/icons-material/Close';

const rowsPerPage = 10;

export const ComputationsPage = () => {
  const { computationState, getComputations, isLoading } = useComputation();
  const [page, setPage] = useState(0);
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const initialFormData = {
    suggestion: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadComputations = async (forceUpdate: boolean = false) => {
    getComputations(false, forceUpdate);
  }

  useEffect(() => {
    loadComputations();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleGoToComputation = (id: any) => {
    navigate(`/computation/${id}`);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDialogNewSuggestion = () => {
    setFormData({ ...initialFormData });
    setDialogOpen(true);
  };

  const handleSaveComputationSuggestion = async () => {
    if (formData.suggestion.trim() == '') {
      setSnackBarInfo({
        message: 'Please enter a suggestion.',
        type: 'error'
      });
      return;
    }

    const [result, message] = await Computations.createComputationSuggestion(formData);
    
    if (result) {
      setSnackBarInfo({
        message: 'New suggestion send successfully.',
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

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (computationState.computations?.length ?? 0)) : 0;
  
  return (
    <MainPageContainer title='Computations'>
      {isLoading() ? <PageLoading /> : !computationState.computations || computationState.computations?.length <= 0 ?
        <EmptyData title='No computations' subtitle='Check back later for new computations' /> :
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer sx={isMobile ? { maxWidth: '87vw' } : {}}>
              <Table aria-label="computations table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align='center'>Return Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {computationState.computations?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((computation) => (
                      <TableRow tabIndex={-1} key={computation.id} sx={{ cursor: 'pointer' }}>
                        <TableCell onClick={() => handleGoToComputation(computation?.id)}>{computation?.name}</TableCell>
                        <TableCell onClick={() => handleGoToComputation(computation?.id)}>{computation?.description?.substring(0, 200) + (computation?.description?.length > 200 ? '...' : '') }</TableCell>
                        <TableCell align="center" onClick={() => handleGoToComputation(computation?.id)}>
                          <ReturnTypeIcon returnType={computation?.returnType} />
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
              count={computationState.computations?.length ?? 0}
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
          title='New Suggestion'
          icon={<Add sx={{ mr: 1 }} />}
          onClick={handleOpenDialogNewSuggestion}
        />
      </FabFixedBottomContainer>

      {/* Snackbar */}
      <SnackBar
        snackBarInfo={snackBarInfo}
        onCloseSnackbar={() => setSnackBarInfo(null)}
      />

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullScreen={isMobile}>
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
              New Computation Suggestion
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSaveComputationSuggestion}>
              <Save sx={{ mr: 1 }} />
              Send
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Box component="form" id='formSuggestion'>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography>
                  Write your computation suggestion and send it to the system administrator to be evaluated. If approved, it can be added to the list of computations available.
                </Typography>
                <TextField
                  id="suggestion"
                  sx={{mt: 3}}
                  required
                  label="New computation suggestion"
                  multiline
                  minRows={15}
                  inputProps={{maxLength:'2000'}}
                  fullWidth
                  variant="outlined"
                  value={formData.suggestion}
                  onChange={(e: any) => setFormData({ ...formData, suggestion: e.currentTarget.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>

    </MainPageContainer>
  );
}
