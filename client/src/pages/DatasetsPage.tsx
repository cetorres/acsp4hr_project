import { Search, Send } from '@mui/icons-material';
import { Box, Divider, IconButton, InputBase, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyData from '../components/EmptyData';
import MainPageContainer from '../components/MainPageContainer';
import PageLoading from '../components/PageLoading';
import RequiresPermissionIndicator from '../components/RequiresPermissionIndicator';
import { useDataset } from '../contexts/DatasetContext';

export const DatasetsPage = () => {
  const { datasetState, browseDatasets, isLoading } = useDataset();
  const [searchText, setSearchText] = useState(datasetState.datasetSearchText);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const rowsPerPage = 20;

  useEffect(() => {
    browseDatasets();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleGoToDataset = (id: any) => {
    navigate(`/datasets/${id}`);
  };

  const handleSearchButton = () => {
    browseDatasets(searchText);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (datasetState.datasets?.length ?? 0)) : 0;
  
  return (
    <MainPageContainer title='Datasets'>
      <Paper sx={{ width: "100%", px: '16px', mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton sx={{ p: '10px' }} aria-label="menu">
          <Search />
        </IconButton>
        <InputBase
          id="searchText"
          placeholder='Search'
          autoComplete='no'
          autoFocus={true}
          type="text"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.currentTarget.value)}
          onKeyDown={(e) => { if (e.key == 'Enter') { handleSearchButton(); }}}
          sx={{ ml: 1, flex: 1 }}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton color="primary" sx={{ p: '10px' }} aria-label="search" onClick={handleSearchButton}>
          <Send />
        </IconButton>
      </Paper>
      {isLoading() ? <PageLoading /> : !datasetState.datasets || datasetState.datasets?.length <= 0 ?
        <EmptyData
          title='No datasets found'
          subtitle='Try different search criteria'
        /> :
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer sx={isMobile ? { maxWidth: '87vw' } : {}}>
              <Table aria-label="datasets table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Requires permission</TableCell>
                    <TableCell>Rows</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Created at</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datasetState.datasets?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                        <TableCell onClick={() => handleGoToDataset(dataset.id)}>{dataset.__user__ ? `${dataset.__user__?.firstName} ${dataset.__user__?.lastName}` : '-'}</TableCell>
                        <TableCell onClick={() => handleGoToDataset(dataset.id)}>{dataset.createdAt ? new Date(dataset.createdAt)?.toLocaleString() : '-'}</TableCell>
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
              count={datasetState.datasets?.length ?? 0}
              rowsPerPageOptions={[rowsPerPage]}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
            />
          </Paper>
        </>
      }
    </MainPageContainer>
  );
}
