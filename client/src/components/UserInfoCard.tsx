import { Card, Typography, Divider, CardHeader, Avatar, CardContent, CardActions } from '@mui/material'
import { red } from '@mui/material/colors'

export default function UserInfoCard(props: any) {
  return (
    <Card sx={{ maxWidth: 400 }}>
      <Typography sx={{ px: 2, pt: 2, pb: 1, fontSize: 14 }} color="text.secondary" gutterBottom>
        {props.title ? props.title : 'User Info'}
      </Typography>
      <Divider />
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[300] }} aria-label="owner">
            {props.user?.firstName.charAt(0) + props.user?.lastName.charAt(0)}
          </Avatar>
        }
        title={`${props.user?.firstName} ${props.user?.lastName}`}
        subheader={props.user?.email}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {props.user?.bio}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        {/* <Button size="small" onClick={() => handleSendMessage(props.user?.id)}>Send Message</Button> */}
        <Typography sx={{ textAlign: 'right', width: '100%', px: 2, fontSize: 12 }} color="text.secondary" gutterBottom>
          {`User since ${props.user?.createdAt ? new Date(props.user?.createdAt)?.toLocaleString('en-US', { dateStyle: 'medium' }) : '-'}`}
        </Typography>
      </CardActions>
    </Card>
  )
}
