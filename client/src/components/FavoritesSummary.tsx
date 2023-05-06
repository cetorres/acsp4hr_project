import { Box, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDataset } from "../contexts/DatasetContext";
import EmptyData from "./EmptyData";
import PageLoading from "./PageLoading";

export default function FavoritesSummary() {
  const { datasetState, getFavorites, isLoading } = useDataset();
  const navigate = useNavigate();
  const maxItemsToShow = 5;
  
  useEffect(() => {
    getFavorites();
  }, []);

  const handleGoToDataset = (id: any) => {
    navigate(`/datasets/${id}`);
  };

  return (
    <Box>
    { isLoading() ? <PageLoading /> : !datasetState.favorites || datasetState.favorites?.length <= 0 ?
      <EmptyData
        title='No favorite datasets'
        subtitle='Get started by favoriting a dataset'
      /> :
      <>
        <InputLabel>
          My Favorite Datasets ({datasetState.favorites?.length})
        </InputLabel>
        <TableContainer sx={{ maxWidth: '79vw' }}>
          <Table aria-label="datasets table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Rows</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Created at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datasetState.favorites.slice(0,maxItemsToShow)
                .map((favorite) => (
                  <TableRow tabIndex={-1} key={favorite.id} sx={{ cursor: 'pointer' }}>
                    <TableCell onClick={() => handleGoToDataset(favorite.dataset?.id)}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{  }}>
                          <Typography component="div" variant="inherit">
                            {favorite.dataset?.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleGoToDataset(favorite.dataset?.id)}>
                        {favorite.dataset?.rows}
                    </TableCell>
                    <TableCell onClick={() => handleGoToDataset(favorite.dataset?.id)}>{favorite.user? `${favorite.user?.firstName} ${favorite.user?.lastName}` : '-'}</TableCell>
                    <TableCell onClick={() => handleGoToDataset(favorite.dataset?.id)}>{favorite.createdAt ? new Date(favorite.createdAt)?.toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    }
  
    </Box>
  )
}
