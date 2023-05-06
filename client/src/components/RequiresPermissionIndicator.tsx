import { Chip } from "@mui/material";

export default function RequiresPermissionIndicator(props: any) {
  return (
    <>
      {props.requiresPermission ? <Chip label="Yes" color="default" /> : <Chip label="No" color="success" />}
    </>
  )
}
