import { Subject, InsertChart, VerticalSplit } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import { ComputationReturnType } from '../api/computations/computation'

export default function ReturnTypeIcon(props: any) {
  return (
    props.returnType == ComputationReturnType.Text ?
      props.showText ? <><Subject sx={{ verticalAlign: 'top' }} color='primary' /> <span style={{ verticalAlign: 'middle' }}>Text</span></>
        : <Tooltip title="Text">
        <Subject sx={{ verticalAlign: 'top' }} color='primary' />
      </Tooltip> :
    props.returnType == ComputationReturnType.Graph ?
      props.showText ? <><InsertChart sx={{ verticalAlign: 'top' }} color='primary' /> <span style={{ verticalAlign: 'middle' }}>Graph</span></> :
      <Tooltip title="Graph">
        <InsertChart sx={{ verticalAlign: 'top' }} color='primary' />
      </Tooltip> :
      props.showText ? <><VerticalSplit sx={{ verticalAlign: 'top' }} color='primary' /> <span style={{ verticalAlign: 'middle' }}>Text and Graph</span></> :
      <Tooltip title="Text and Graph">
        <VerticalSplit sx={{ verticalAlign: 'top' }} color='primary' />
      </Tooltip>
  )
}
