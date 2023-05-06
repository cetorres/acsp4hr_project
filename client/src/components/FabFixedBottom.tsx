import Fab from "@mui/material/Fab";

export default function FabFixedBottom(props: any) {
  return (
    <Fab
      variant={props.variant ? props.variant : 'extended'}
      color={props.color ? props.color : 'primary'}
      sx={{
        position: 'fixed',
        bottom: props.positionBottom ? props.positionBottom : 24,
        right: props.positionRight ? props.positionRight : 24,
        paddingX: props.paddingX ? props.paddingX : 4
      }}
      disabled={props.disabled ? props.disabled : false}
      onClick={props.onClick}>
      {props.icon}
      {props.title}
    </Fab>
  )
}
