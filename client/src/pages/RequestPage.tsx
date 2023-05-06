import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainPageContainer from "../components/MainPageContainer";
import { SnackBar, SnackBarInfo } from "../components/SnackBar";
import { useRequest } from "../contexts/RequestContext";
import { Request, RequestStatus } from '../api/requests/request';
import PageLoading from "../components/PageLoading";
import EmptyData from "../components/EmptyData";
import { Check, Clear, MoveToInbox } from "@mui/icons-material";
import { Box, Chip, Grid, InputLabel, Paper, TextField, Typography } from "@mui/material";
import UserInfoCard from "../components/UserInfoCard";
import FabFixedBottom from "../components/FabFixedBottom";
import FabFixedBottomContainer from "../components/FabFixedBottomContainer";
import { EntityLink } from "../components/Common";

export default function RequestPage() {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null as unknown as Request | null);
  const { getRequestToMe, approveRejectRequest, getPendingRequestsToMe, isLoading } = useRequest();
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const navigate = useNavigate();

  const loadRequest = async (forceUpdate: boolean = false) => {
    const r = await getRequestToMe(requestId, forceUpdate);
    setRequest(r);
  }

  useEffect(() => {
    loadRequest();
  }, []);

  const handleGoToRequests = () => {
    navigate('/requests');
  };

  const handleRequestAccept = async () => {
    const data = {
      ownerId: request?.__owner__.id,
      status: RequestStatus.Granted,
      requestId: request?.id
    };

    const message = await approveRejectRequest(data);
    
    if (message == null) {
      loadRequest(true);
      getPendingRequestsToMe();
      setSnackBarInfo({
        message: 'Request access granted.',
        type: 'success'
      });
    }
    else {
      setSnackBarInfo({
        message: 'Error: ' + message,
        type: 'error'
      });
    }
  };

  const handleRequestReject = async () => {
    const data = {
      ownerId: request?.__owner__.id,
      status: RequestStatus.Denied,
      requestId: request?.id
    };

    const message = await approveRejectRequest(data);
    
    if (message == null) {
      loadRequest(true);
      getPendingRequestsToMe();
      setSnackBarInfo({
        message: 'Request access denied.',
        type: 'success'
      });
    }
    else {
      setSnackBarInfo({
        message: 'Error: ' + message,
        type: 'error'
      });
    }
  };

  const handleRequestRevoke = async () => {
    const data = {
      ownerId: request?.__owner__.id,
      status: RequestStatus.Pending,
      requestId: request?.id
    };

    const message = await approveRejectRequest(data);
    
    if (message == null) {
      loadRequest(true);
      getPendingRequestsToMe();
      setSnackBarInfo({
        message: 'Request access revoked.',
        type: 'success'
      });
    }
    else {
      setSnackBarInfo({
        message: 'Error: ' + message,
        type: 'error'
      });
    }
  };

  return (
    <MainPageContainer title={`Request ${request == null ? 'not found' : 'received'}`}>
      {isLoading() ? <PageLoading /> : request == null ?
        <EmptyData
          title='Request not found'
          buttonTitle='Go to Requests'
          icon={<MoveToInbox />}
          buttonClick={handleGoToRequests}
        />
        :
        <>
          <Box sx={{ marginTop: 3 }}>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ width: "100%", p: '16px' }}>
                  <InputLabel sx={{ fontSize: 12 }}>Dataset</InputLabel>
                  <Link style={EntityLink} to={`/my-datasets/${request?.__dataset__?.id}`}>
                    {request?.__dataset__?.name}
                  </Link>
                  
                  <TextField
                    margin="dense"
                    id="description"
                    label="Description"
                    type="text"
                    multiline={true}
                    maxRows={4}
                    fullWidth
                    variant="standard"
                    value={request?.description}
                    InputProps={{readOnly: true}}
                    sx={{ mt: 3, mb: 2 }}
                  />

                  <InputLabel sx={{ mt: 3, mb:1, fontSize: 12 }}>Status</InputLabel>
                  {request.status == RequestStatus.Pending ? (
                    <Chip label={RequestStatus[request.status]} color="warning" />
                  ) : request.status == RequestStatus.Denied ? (
                    <Chip label={RequestStatus[request.status]} color="error" />
                  ) : (
                    <Chip label={RequestStatus[request.status]} color="success" />
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} justifyContent="center" alignItems="center">
                <UserInfoCard title='Requester' user={request?.__requester__} />
              </Grid>
            </Grid>
          </Box>

          <FabFixedBottomContainer>
            {request?.status == RequestStatus.Pending ?
              <>
                <FabFixedBottom
                  title='Reject'
                  color='error'
                  positionRight={190}
                  icon={<Clear sx={{ mr: 1 }} />}
                  onClick={handleRequestReject}
                />
                <FabFixedBottom
                  title='Grant'
                  color='success'
                  icon={<Check sx={{ mr: 1 }} />}
                  onClick={handleRequestAccept}
                />
              </>
              :
              <FabFixedBottom
                title='Revoke'
                color='warning'
                icon={<Clear sx={{ mr: 1 }} />}
                onClick={handleRequestRevoke}
              />
            }
          </FabFixedBottomContainer>
        </>
      }

      <SnackBar
        snackBarInfo={snackBarInfo}
        onCloseSnackbar={() => setSnackBarInfo(null)}
      />
    </MainPageContainer>
  );
}