import { Box, CircularProgress, Typography } from "@mui/material";

export default function PageLoading(props: any) {
  return (
    <Box sx={{ display: 'flex', height: '80%', alignItems: 'center', justifyContent: 'center', justifyItems: 'center' }}>
      <CircularProgress size={25} />
      <Typography sx={{ ml: 2, fontSize: '1.2rem'}}>
        {props.title ? props.title : 'Loading...'}
      </Typography>
    </Box>
  )
}
