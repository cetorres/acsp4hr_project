import { Box, Chip, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RequestStatus } from "../api/requests/request";
import { useRequest } from "../contexts/RequestContext";
import EmptyData from "./EmptyData";
import PageLoading from "./PageLoading";


export default function RequestsSummary() {
  const { requestState, getPendingRequestsToMe, isLoading } = useRequest();
  const navigate = useNavigate();
  
  useEffect(() => {
    getPendingRequestsToMe();
  }, []);

  const handleGoToRequest = (id: any) => {
    navigate(`/requests/${id}`);
  };

  return (
    <Box>
    { isLoading() ? <PageLoading /> : !requestState.pendingRequestsToMe || requestState.pendingRequestsToMe?.length <= 0 ?
      <EmptyData
        title='No pending requests'
      /> :
      <>
        <InputLabel>
          Pending Requests Received ({requestState.pendingRequestsToMe?.length})
        </InputLabel>
        <TableContainer sx={{ maxWidth: '79vw' }}>
          <Table aria-label="datasets table">
            <TableHead>
              <TableRow>
                <TableCell>Dataset</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Created at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requestState.pendingRequestsToMe
                .map((request) => (
                  <TableRow tabIndex={-1} key={request.id} sx={{ cursor: 'pointer' }}>
                    <TableCell onClick={() => handleGoToRequest(request.id)}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{  }}>
                          <Typography component="div" variant="inherit">
                            {request.__dataset__?.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleGoToRequest(request.id)}>
                      {request.status == RequestStatus.Pending ? (
                        <Chip label={RequestStatus[request.status]} color="warning" />
                      ) : request.status == RequestStatus.Denied ? (
                        <Chip label={RequestStatus[request.status]} color="error" />
                      ) : (
                        <Chip label={RequestStatus[request.status]} color="success" />
                      )}
                    </TableCell>
                    <TableCell onClick={() => handleGoToRequest(request.id)}>{request.__requester__ ? `${request.__requester__?.firstName} ${request.__requester__?.lastName}` : '-'}</TableCell>
                    <TableCell onClick={() => handleGoToRequest(request.id)}>{request.createdAt ? new Date(request.createdAt)?.toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    }
  
    </Box>
  )
}
