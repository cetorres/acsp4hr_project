import { Box } from '@mui/material'

export default function FabFixedBottomContainer(props: any) {
  return (
    <Box sx={{ marginTop: props.marginTop ? props.marginTop : '48px' }}>
      {props.children}
    </Box>
  )
}
