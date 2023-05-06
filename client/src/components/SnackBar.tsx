import { Alert, AlertColor, Snackbar } from "@mui/material";

export interface SnackBarInfo {
  message: string;
  type: AlertColor;
  hideDuration?: number;
}

interface SnackBarProps {
  snackBarInfo: SnackBarInfo | null;
  onCloseSnackbar: () => void;
}

export const SnackBar = (props: SnackBarProps) => {
  const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    props.onCloseSnackbar();
  };

  return (
    <Snackbar
      open={props.snackBarInfo != null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      autoHideDuration={props.snackBarInfo?.hideDuration ? props.snackBarInfo.hideDuration : 3000}
      onClose={handleCloseSnackbar}
    >
      <Alert onClose={handleCloseSnackbar} variant="filled" severity={props.snackBarInfo?.type} sx={{ width: '100%' }}>
        {props.snackBarInfo?.message}
      </Alert>
    </Snackbar>
  )
};