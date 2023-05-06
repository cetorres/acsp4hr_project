import { useEffect, useState } from "react";
import { ComputationSuggestion } from "../api/computations/computation_suggestion";
import Computations from "../api/computations/computations";
import MainPageContainer from "../components/MainPageContainer";
import EmptyData from "../components/EmptyData";
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, useMediaQuery, useTheme } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { SnackBar, SnackBarInfo } from "../components/SnackBar";

const rowsPerPage = 10;

export const ComputationSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([] as ComputationSuggestion[] | null);
  const [currentSuggestion, setCurrentSuggestion] = useState(null as ComputationSuggestion | null);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [page, setPage] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);

  const loadSuggestions = async () => {
    const [list, _] = await Computations.getComputationSuggestions();
    setSuggestions(list);
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleOpenDeleteDialog = (suggestion: ComputationSuggestion) => {
    setCurrentSuggestion(suggestion);
    setDialogDeleteOpen(true);
  };

  const handleDelete = async () => {
    const [result, message] = await Computations.deleteComputationSuggestion(Number(currentSuggestion?.id));
    
    if (result) {
      loadSuggestions();
      setSnackBarInfo({
        message: 'User deleted successfully.',
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

  useEffect(() => {
    loadSuggestions();
  }, []);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (suggestions?.length ?? 0)) : 0;

  return (
    <MainPageContainer title='Computation Suggestions'>
      {!suggestions || suggestions?.length <= 0 ? <EmptyData title='No computation suggestions' subtitle='Check back later for new computation suggestions.' /> :
        <>
          <Paper sx={{ width: "100%", mb: 2 }}>
            <TableContainer sx={isMobile ? { maxWidth: '87vw' } : {}}>
              <Table aria-label="computations table">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Suggestion</TableCell>
                    <TableCell>Created at</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suggestions?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((suggestion) => (
                      <TableRow tabIndex={-1} key={suggestion.id} sx={{ cursor: 'pointer' }}>
                        <TableCell>{suggestion?.__user__?.firstName} {suggestion?.__user__?.lastName}</TableCell>
                        <TableCell>{suggestion?.suggestion}</TableCell>
                        <TableCell>{suggestion?.createdAt ? new Date(suggestion.createdAt)?.toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          <IconButton
                            size="large"
                            edge="end"
                            title='Delete User'
                            onClick={(e) => handleOpenDeleteDialog(suggestion)}
                            aria-label="delete user"
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
              count={suggestions?.length ?? 0}
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
        title='Delete'
        body={`Confirm deleting this suggestion?`}
        handleYes={handleDelete}
        handleNo={() => { }}
      />
    </MainPageContainer>
  );
}