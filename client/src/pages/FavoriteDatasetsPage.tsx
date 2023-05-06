import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyData from '../components/EmptyData';
import MainPageContainer from '../components/MainPageContainer';
import PageLoading from '../components/PageLoading';
import { useDataset } from '../contexts/DatasetContext';

export const FavoriteDatasetsPage = () => {
  const { datasetState, getFavorites, isLoading } = useDataset();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const rowsPerPage = 20;

  useEffect(() => {
    getFavorites();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleGoToDataset = (id: any) => {
    navigate(`/datasets/${id}`);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (datasetState.favorites?.length ?? 0)) : 0;

  return (
    <MainPageContainer title='Favorite datasets'>
      {isLoading() ? <PageLoading /> : !datasetState.favorites || datasetState.favorites?.length <= 0 ?
        <EmptyData
          title='No favorite datasets'
          subtitle='Get started by favoriting a dataset'
        /> :
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer sx={isMobile ? { maxWidth: '87vw' } : {}}>
              <Table aria-label="datasets table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Rows</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Added at</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datasetState.favorites?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((favorite) => (
                      <TableRow tabIndex={-1} key={favorite.dataset.id} sx={{ cursor: 'pointer' }}>
                        <TableCell onClick={() => handleGoToDataset(favorite.dataset.id)}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ ml: 2 }}>
                              <Typography component="div" variant="inherit">
                                {favorite.dataset.name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell onClick={() => handleGoToDataset(favorite.dataset.id)}>{favorite.dataset.description ?? '-'}</TableCell>
                        <TableCell onClick={() => handleGoToDataset(favorite.dataset.id)}>{favorite.dataset.rows ?? '0'}</TableCell>
                        <TableCell onClick={() => handleGoToDataset(favorite.dataset.id)}>{favorite.user ? `${favorite.user?.firstName} ${favorite.user?.lastName}` : '-'}</TableCell>
                        <TableCell onClick={() => handleGoToDataset(favorite.dataset.id)}>{favorite.dataset.createdAt ? new Date(favorite.dataset.createdAt)?.toLocaleString() : '-'}</TableCell>
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
              count={datasetState.favorites?.length ?? 0}
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
