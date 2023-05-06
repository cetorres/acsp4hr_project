import { Calculate, Clear, Description, Save } from "@mui/icons-material";
import { Box, Button, CircularProgress, FormControlLabel, Grid, IconButton, InputAdornment, Switch, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dataset } from "../api/datasets/dataset";
import FabFixedBottom from "../components/FabFixedBottom";
import MainPageContainer from "../components/MainPageContainer";
import { SnackBar, SnackBarInfo } from "../components/SnackBar";
import { DataGrid, GridColDef, GridRowModel } from '@mui/x-data-grid';
import TabPanel from "../components/TabPanel";
import FabFixedBottomContainer from "../components/FabFixedBottomContainer";
import PageLoading from "../components/PageLoading";
import Datasets from "../api/datasets/datasets";
import { useDataset } from "../contexts/DatasetContext";
import { MuiChipsInput } from 'mui-chips-input'

interface Variable {
  name: string;
  description?: string | null;
  type: string;
  order: number;
}

interface FormDataType {
  name: string;
  description: string;
  documentName: string;
  datasetFile?: Blob | null;
  variables: Variable[];
  rows: number;
  isActive: boolean;
  requiresPermission: boolean;
  keywords?: string | null;
}

export const NewDatasetPage = () => {
  const { datasetId } = useParams();
  const [snackBarInfo, setSnackBarInfo] = useState(null as SnackBarInfo | null);
  const uploadDatasetFileRef = useRef(null);
  const formUploadDataset = useRef(null as HTMLFormElement | null);
  const refVariablesDataGrid = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [currentDataset, setCurrentDataset] = useState(null as Dataset | null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialFormData: FormDataType = {
    name: '',
    description: '',
    documentName: '',
    datasetFile: null,
    variables: [],
    rows: 0,
    isActive: true,
    requiresPermission: true,
    keywords: null
  };

  const { getMyDataset, createDataset, updateDataset } = useDataset();
  const [formData, setFormData] = useState(initialFormData);
  const [keywords, setKeywords] = useState([] as string[]);
  const [rows, setRows] = useState([] as any[]);
  const [variables, setVariables] = useState([] as any[]);
  const [columnsDef, setColumnsDef] = useState([] as GridColDef[]);
  const [selectedTab, setSelectedTab] = useState(0);
  const variablesColumnsDef = [
    {
      field: 'name',
      headerName: 'Name',
      editable: false,
      minWidth: 200
    },
    {
      field: 'description',
      headerName: 'Description',
      editable: true,
      minWidth: 400
    },
    {
      field: 'type',
      headerName: 'Type',
      editable: false
    }
  ];

  const loadDataset = async () => {
    setLoading(true);
    const result = await getMyDataset(datasetId);
    if (!result) {
      navigate('/my-datasets');
      return;
    }

    setCurrentDataset(result);
    setFormData({
      ...initialFormData,
      name: result?.name,
      description: result?.description,
      documentName: result?.documentName,
      rows: result?.rows,
      isActive: result?.isActive,
      requiresPermission: result?.requiresPermission,
      keywords: result?.keywords
    });
    setKeywords(result?.keywords ? result?.keywords.split(',') : []);
    loadDataAndVariables({ ...result });
    setLoading(false);
  }

  useEffect(() => {
    if (datasetId)
      loadDataset();
  }, []);

  const handleSave = async () => {
    const form = document.getElementById('formDataset') as HTMLFormElement;
    if (!form.reportValidity()) return;

    // Clean variables
    formData.variables = [];
    variables.forEach((variable: Variable) => {
      const varRow = {
        name: variable.name,
        description: variable.description,
        type: variable.type,
        order: variable.order
      };
      formData.variables.push(varRow);
    });

    // Update rows
    if (!currentDataset) {
      formData.rows = rows.length;
    }

    // Update keywords
    formData.keywords = keywords == [] as string[] || keywords == null ? null : keywords.join(',');

    // Update formData
    setFormData({ ...formData });

    if (currentDataset) {
      const message = await updateDataset(Number(currentDataset?.id), formData);
    
      if (message == null) {
        setSnackBarInfo({
          message: 'Dataset saved successfully.',
          type: 'success'
        });
        handleCancel();
      }
      else {
        setSnackBarInfo({
          message: 'Error: ' + message,
          type: 'error'
        });
      }
    }
    else {
      // Test if file exists
      if (!formData.datasetFile) {
        setSnackBarInfo({
          message: 'Please upload a dataset file.',
          type: 'error'
        });
        return;
      }
      
      const message = await createDataset(formData);
    
      if (message == null) {
        setSnackBarInfo({
          message: 'Dataset created successfully.',
          type: 'success'
        });
        handleCancel();
      }
      else {
        let msg = message;
        setSnackBarInfo({
          message: 'Error: ' + msg,
          type: 'error'
        });
      }
    }
  };

  const getDatasetFileInfo = async (datasetFile: Blob | null = null, documentName = '') => {
    setUploading(true);
    setFormData({
      ...formData,
      datasetFile: datasetFile,
      documentName: documentName
    });

    const [result, obj] = await Datasets.getDatasetInfo({datasetFile, documentName});

    setUploading(false);

    if (result && obj) {
      loadDataAndVariables(obj);
      
      setSnackBarInfo({
        message: 'Dataset uploaded successfully.',
        type: 'success'
      });
    }
    else {
      setRows([]);
      setVariables([]);

      let msg = obj;
      setSnackBarInfo({
        message: 'Error: ' + msg,
        type: 'error'
      });
    }
  };

  const loadDataAndVariables = (obj: any) => {
    // Load DataGrid columns
    const variablesObj: any[] = [];
    const colsDef: GridColDef[] = [];
    const variablesRows: any[] = [];
    obj.variables.forEach((variable: Variable, i: number) => {
      const col = {
        field: variable.name,
        headerName: variable.name,
        editable: false,
      };
      colsDef.push(col);
      variablesObj.push(variable.name);

      const id = i + 1;
      const varRow = {
        id: id,
        name: variable.name,
        description: variable.description,
        type: variable.type,
        order: id
      };
      variablesRows.push(varRow);
    });
    

    // Load DataGrid rows only if for uploaded file, not an existent dataset
    if (!datasetId) {
      const rowsForDataGrid = [];
      for (let i = 0; i < obj?.rows?.length; i++) {
        const id = i + 1;
        rowsForDataGrid.push({ ...obj?.rows[i], id });
      }
      setRows(rowsForDataGrid);
    }

    setColumnsDef(colsDef);
    setVariables(variablesRows);
  };

  const handleCancel = () => {
    navigate('/my-datasets');
  };

  const handleRunComputation = () => {
    navigate(`/computation-run/?datasetId=${currentDataset?.id}`);
  };

  return (
    <MainPageContainer title={currentDataset ? 'My dataset' : 'New dataset'}>
      
      {loading ? <PageLoading /> :
        <>
          {currentDataset != null ? null :
            <Box component="form" ref={formUploadDataset} sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === "dark" ? 'action.disabledBackground' : 'rgb(230 230 230)'
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ textAlign: 'center' }}>
                  <label>
                    <Button
                      variant='contained'
                      component="span"
                      disabled={uploading}
                      sx={{ marginTop: 4, marginBottom: 1 }}>
                      Upload Dataset file
                      {uploading && (
                        <CircularProgress
                          size={24}
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px',
                          }}
                        />
                      )}
                    </Button>
                    <Typography variant="body2" color="GrayText" sx={{ marginTop: 1, marginBottom: 4 }}>
                      Max size: 10MB - File type: *.csv
                    </Typography>
                    <input
                      ref={uploadDatasetFileRef}
                      required
                      onChange={(e) => {
                        getDatasetFileInfo(
                          e.target.files?.length ? e.target.files[0] : null,
                          e.target.files?.length ? e.target.files[0].name : ''
                        );
                      }}
                      accept="text/plain,.csv,.txt"
                      style={{ display: 'none' }}
                      id="datasetFile"
                      type="file"
                    />
                  </label>
                </Grid>
              </Grid>
            </Box>
          }

          <Box component="form" id='formDataset' sx={{ marginTop: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="name"
                  required
                  label="Name"
                  autoFocus={true}
                  type="text"
                  fullWidth
                  variant="standard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  disabled
                  margin="dense"
                  type="text"
                  id="documentName"
                  label="Dataset file name"
                  name="documentName"
                  variant="standard"
                  value={formData.documentName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      currentDataset != null ? null :
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="clear document name"
                          disabled={formData.documentName == ''}
                          title='Clear dataset file name'
                          
                          onClick={() => {
                            setFormData({
                              ...formData,
                              datasetFile: null,
                              documentName: ''
                            });
                            setRows([]);
                            setVariables([]);
                            formUploadDataset?.current?.reset();
                          }}
                          edge="end"
                        >
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  required
                  id="description"
                  label="Description"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="dense"
                      disabled
                      id="rows"
                      label="Number of rows"
                      type="text"
                      fullWidth
                      variant="standard"
                      value={currentDataset ? formData.rows : rows.length}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      margin="dense"
                      disabled
                      id="variables"
                      label="Number of variables"
                      type="text"
                      fullWidth
                      variant="standard"
                      value={variables.length}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <MuiChipsInput
                  margin="dense"
                  id="chipsKeywords"
                  label="Keywords"
                  variant="standard"
                  helperText="Type a keyword and press enter. Double-click to edit."
                  fullWidth
                  hideClearAll
                  value={keywords ? keywords : []}
                  onChange={(newChips) => setKeywords(newChips)}
                  validate={(chipValue) => {
                    return {
                      isError: chipValue.length < 3 || chipValue.includes(','),
                      textError: 'keyword must be at least 3 characters long and no commas allowed'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel control={
                  <Switch
                    id="checkIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                } label="Active" />
                <FormControlLabel sx={{ml: 2}} control={
                  <Switch
                    id="checkRequiresPermission"
                    checked={!!formData.requiresPermission}
                    onChange={(e) => setFormData({ ...formData, requiresPermission: e.currentTarget.checked })}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                } label="Requires Permission to Access" />
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop: 4 }}>
            <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
              <Tab label="Variables" id='tab-0' aria-controls='simple-tabpanel-0' />
              {datasetId ? null :
                <Tab label="Data" id='tab-1' aria-controls='simple-tabpanel-1' />
              }
            </Tabs>
          </Box>

          <TabPanel value={selectedTab} index={0}>
            <Box sx={{ height: '100%', width: '100%', }}>
              <DataGrid
                ref={refVariablesDataGrid}
                rows={variables}
                columns={variablesColumnsDef}
                pageSize={50}
                autoHeight={true}
                autoPageSize={true}
                checkboxSelection
                loading={uploading}
                disableSelectionOnClick
                processRowUpdate={(newRow: GridRowModel) => {
                  const newVariables = variables.map((row: any) => (row.id === newRow.id ? newRow : row))
                  setVariables(newVariables);
                  return newRow;
                }}
                experimentalFeatures={{ newEditingApi: true }}
              />
            </Box>
          </TabPanel>
     
          {datasetId ? null :
            <TabPanel value={selectedTab} index={1}>
              <Box sx={{ height: '100%', width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columnsDef}
                  pageSize={50}
                  autoHeight={true}
                  autoPageSize={true}
                  checkboxSelection
                  loading={uploading}
                  disableSelectionOnClick
                  experimentalFeatures={{ newEditingApi: true }}
                />
              </Box>
            </TabPanel>
          }

          <FabFixedBottomContainer marginTop='108px'>
            {currentDataset ?
              <FabFixedBottom
                title='Run Computation'
                color='success'
                // positionRight={345}
                positionBottom={88}
                icon={<Calculate sx={{ mr: 1 }} />}
                onClick={handleRunComputation}
              /> : null}
            <FabFixedBottom
              title='Cancel'
              color='default'
              paddingX={3}
              positionRight={173}
              icon={<Clear sx={{ mr: 1 }} />}
              onClick={handleCancel}
            />
            <FabFixedBottom
              title='Save'
              icon={<Save sx={{ mr: 1 }} />}
              onClick={handleSave}
            />
          </FabFixedBottomContainer>
        </>
      }
      <SnackBar
        snackBarInfo={snackBarInfo}
        onCloseSnackbar={() => setSnackBarInfo(null)}
      />
    </MainPageContainer>    
  )
}
