import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default function EmptyData(props: any) {
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 4,
        flex: '1 1 100%'
      }}
    >
      <InboxIcon color="disabled" fontSize="large" sx={{ mb: 2 }} />
      <Typography component="div" gutterBottom variant="h6">
        {props.title ?? ''}
      </Typography>
      <Typography color="text.secondary">
        {props.subtitle ?? ''}
      </Typography>
      {props.buttonTitle ?
        <Button
          size="large"
          startIcon={props.icon ? props.icon : <AddIcon />}
          sx={{ mt: 4 }}
          variant="contained"
          onClick={props.buttonClick}
        >
          {props.buttonTitle}
        </Button>
        : ''}
    </Container>
  );
}