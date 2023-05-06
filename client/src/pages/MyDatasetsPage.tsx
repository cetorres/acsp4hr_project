import { AlertColor, Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Dataset } from '../api/datasets/dataset';
import MainPageContainer from '../components/MainPageContainer';
import { Add, Delete } from '@mui/icons-material';
import { ConfirmDialog } from '../components/ConfirmDialog';
import EmptyData from '../components/EmptyData';
import { useNavigate } from 'react-router-dom';
import FabFixedBottom from '../components/FabFixedBottom';
import PageLoading from '../components/PageLoading';
import { SnackBar } from '../components/SnackBar';
import { useDataset } from '../contexts/DatasetContext';
import RequiresPermissionIndicator from '../components/RequiresPermissionIndicator';
import ActiveIndicator from '../components/ActiveIndicator';

const rowsPerPage = 20;

export const MyDatasetsPage = () => {
  const { datasetState, getMyDatasets, deleteDataset, isLoading } = useDataset();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [currentDataset, setCurrentDataset] = useState(null as Dataset | null);
  const [snackBarInfo, setSnackBarInfo] = useState(null as { message: string, type: AlertColor } | null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  interface FormDataType {
    name: string;
    description: string;
    documentName: string;
    datasetFile?: Blob | null;
    isActive: boolean;
  }

  const initialFormData: FormDataType = {
    name: '',
    description: '',
    documentName: '',
    datasetFile: null,
    isActive: false
  };

  useEffect(() => {
    getMyDatasets();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleGoToNewDataset = () => {
    navigate('/new-dataset');
  };

  const handleOpenDeleteDialog = (dataset: Dataset) => {
    setCurrentDataset(dataset);
    setDialogDeleteOpen(true);
  };

  const handleDelete = async () => {
    const message = await deleteDataset(Number(currentDataset?.id));
    
    if (message == null) {
      getMyDatasets();
      setSnackBarInfo({
        message: 'Dataset deleted successfully.',
        type: 'success'
      });
    }
    else {
      if (message.includes('Internal server error')) {
        setSnackBarInfo({
          message: `Error: Could not delete dataset. Check if it has computations runs and delete them first.`,
          type: 'error'
        });
      }
      else {
        setSnackBarInfo({
          message: `Error: ${message}`,
          type: 'error'
        });
      }
    }
  }

  const handleGoToDataset = (id: any) => {
    navigate(`/my-datasets/${id}`);
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (datasetState.myDatasets?.length ?? 0)) : 0;
  
  return (
    <MainPageContainer title='My datasets'>
      {isLoading() ? <PageLoading /> : !datasetState.myDatasets || datasetState.myDatasets?.length <= 0 ?
        <EmptyData
          title='No datasets'
          subtitle='Get started by creating a new dataset'
          buttonTitle='New Dataset'
          buttonClick={handleGoToNewDataset}
        /> :
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer sx={isMobile ? { maxWidth: '87vw' } : {}}>
              <Table aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Requires permission</TableCell>
                    <TableCell>Rows</TableCell>
                    <TableCell align='center'>Status</TableCell>
                    <TableCell>Created at</TableCell>
                    <TableCell>Updated at</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datasetState.myDatasets?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((dataset) => (
                      <TableRow tabIndex={-1} key={dataset.id} sx={{ cursor: 'pointer' }}>
                        <TableCell onClick={() => handleGoToDataset(dataset.id)}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ ml: 2 }}>
                              <Typography component="div" variant="inherit">
                                {dataset.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell onClick={() => handleGoToDataset(dataset.id)}>{dataset.description ?? '-'}</TableCell>
                        <TableCell align="center" onClick={() => handleGoToDataset(dataset.id)}>
                          <RequiresPermissionIndicator requiresPermission={dataset.requiresPermission} />
                        </TableCell>
                        <TableCell onClick={() => handleGoToDataset(dataset.id)}>{dataset.rows ?? '0'}</TableCell>
                        <TableCell align="center" onClick={() => handleGoToDataset(dataset.id)}>
                          <ActiveIndicator isActive={dataset.isActive} />
                        </TableCell>
                        <TableCell onClick={() => handleGoToDataset(dataset.id)}>{dataset.createdAt ? new Date(dataset.createdAt)?.toLocaleString() : '-'}</TableCell>
                        <TableCell onClick={() => handleGoToDataset(dataset.id)}>{dataset.updatedAt ? new Date(dataset.updatedAt)?.toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <IconButton
                            size="large"
                            edge="end"
                            title='Delete'
                            onClick={(e) => handleOpenDeleteDialog(dataset)}
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
              count={datasetState.myDatasets?.length ?? 0}
              rowsPerPageOptions={[rowsPerPage]}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
            />
          </Paper>
        </>
      }

      <FabFixedBottom
        title='New'
        icon={<Add sx={{ mr: 1 }} />}
        onClick={handleGoToNewDataset}
      />

      {/* Snackbar */}
      <SnackBar
        snackBarInfo={snackBarInfo}
        onCloseSnackbar={() => setSnackBarInfo(null)}
      />

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={dialogDeleteOpen}
        setOpen={setDialogDeleteOpen}
        title='Delete Dataset'
        body={`Confirm deleting dataset "${currentDataset?.name}"?`}
        handleYes={handleDelete}
        handleNo={() => { }}
      />
    </MainPageContainer>
  );
}
