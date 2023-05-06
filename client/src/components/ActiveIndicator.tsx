import { Chip } from "@mui/material";

export default function ActiveIndicator(props: any) {
  return (
    <>
      {props.isActive ? <Chip label="Active" color="primary" /> : <Chip label="Inactive" />}
    </>
  )
}
