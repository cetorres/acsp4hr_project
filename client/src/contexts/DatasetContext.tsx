import { createContext, useContext, useEffect, useState } from "react";
import { Dataset, Favorite } from "../api/datasets/dataset";
import Datasets from "../api/datasets/datasets";
import { useAuth } from "./AuthContext";

export interface DatasetState {
  datasetSearchText: string;
  datasets: Dataset[] | null;
  datasetsTotal: number;
  myDatasets: Dataset[] | null;
  myDatasetsTotal: number;
  favorites: Favorite[] | null;
  loading: boolean;
}

const INITIAL_STATE: DatasetState = {
  datasetSearchText: '',
  datasets: null,
  datasetsTotal: 0,
  myDatasets: null,
  myDatasetsTotal: 0,
  favorites: null,
  loading: false
};

const DatasetContext = createContext({
  datasetState: INITIAL_STATE,
  clearState: (): void => { },
  browseDatasets: (searchText?: string | null, forceUpdate: boolean = false): Promise<[Dataset[] | null, number]> => new Promise(() => null),
  browseDataset: (datasetId: any): Promise<Dataset | null> => new Promise(() => null),
  getMyDatasets: (forceUpdate: boolean = false): Promise<[Dataset[] | null, number]> => new Promise(() => null),
  getMyDataset: (datasetId: any): Promise<Dataset | null> => new Promise(() => null),
  createDataset: (formData: any): Promise<string | null> => new Promise(() => null),
  updateDataset: (datasetId: number, formData: any): Promise<string | null> => new Promise(() => null),
  deleteDataset: (datasetId: number): Promise<string | null> => new Promise(() => null),
  getFavorites: (forceUpdate: boolean = false): Promise<Favorite[] | null> => new Promise(() => null),
  isLoading: (): boolean => true,
  addFavorite: (datasetId: any): Promise<string | null> => new Promise(() => null),
  deleteFavorite: (datasetId: any): Promise<string | null> => new Promise(() => null),
  isFavorite: (datasetId: any): Promise<boolean> => new Promise(() => null)
});

export const DatasetContextProvider = (props: any) => {
  const [state, setState] = useState(INITIAL_STATE);
  const { authState } = useAuth();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      clearState();
    }
  }, [authState.isAuthenticated]);

  const clearState = (): void => {
    setState(INITIAL_STATE);
  };

  const browseDatasets = async (searchText?: string | null, forceUpdate: boolean = false): Promise<[Dataset[] | null, number]> => {
    if (!forceUpdate && searchText == null && state.datasets && state.datasets.length > 0) {
      return [state.datasets, state.datasetsTotal];
    }

    setState((prevState) => ({
      ...prevState,
      loading: true,
      datasetSearchText: searchText ? searchText : ''
    }));

    const [data, total] = await Datasets.browseDatasets(searchText);
    
    setState((prevState) => ({
      ...prevState,
      datasets: data,
      datasetsTotal: total,
      datasetSearchText: searchText ? searchText : '',
      loading: false
    }));
    return [data, total];
  };

  const browseDataset = async (datasetId: any): Promise<Dataset | null> => {
    const dataset = state.datasets?.find((d) => d.id == datasetId);
    if (dataset?.variables && dataset?.variables.length > 0) {
      return dataset;
    } 

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const data = await Datasets.browseDataset(datasetId);
    state.datasets = state.datasets?.map((d) => d.id == data?.id ? data : d) as Dataset[] | null;

    setState((prevState) => ({
      ...prevState,
      datasets: state.datasets,
      loading: false
    }));

    return data;
  };

  const isLoading = (): boolean => {
    return state.loading;
  };

  const getMyDatasets = async (forceUpdate: boolean = false): Promise<[Dataset[] | null, number]> => {
    if (!forceUpdate && state.myDatasets && state.myDatasets.length > 0) {
      return [state.myDatasets, state.myDatasetsTotal];
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [data, total] = await Datasets.getDatasets();
    
    setState((prevState) => ({
      ...prevState,
      myDatasets: data,
      myDatasetsTotal: total,
      loading: false
    }));
    return [data, total];
  };

  const getMyDataset = async (datasetId: any): Promise<Dataset | null> => {
    const dataset = state.myDatasets?.find((d) => d.id == datasetId);
    if (dataset?.variables && dataset?.variables.length > 0) {
      return dataset;
    } 

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const data = await Datasets.getMyDataset(datasetId);
    const myDatasets = state.myDatasets?.map((d) => d.id == data?.id ? data : d) as Dataset[] | null;

    setState((prevState) => ({
      ...prevState,
      myDatasets: myDatasets,
      loading: false
    }));

    return data;
  };

  const createDataset = async (formData: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Datasets.createDataset(formData);
    
    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    if (result) {
      getMyDatasets(true);
      browseDatasets(null, true);
      return null;
    }

    return message;
  };

  const updateDataset = async (datasetId: number, formData: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Datasets.updateDataset(datasetId, formData);
    
    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    if (result) {
      getMyDatasets(true);
      browseDatasets(null, true);
      return null;
    }

    return message;
  };

  const deleteDataset = async (datasetId: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Datasets.deleteDataset(datasetId);

    setState((prevState) => ({
      ...prevState,
      loading: false
    }));
    
    if (result) {
      getMyDatasets(true);
      browseDatasets(null, true);
      return null;
    }
    return message;
  };

  // const getMyAndOthersDatasets = async (forceUpdate: boolean = false) => {
  //   const [data1, total1] = await getMyDatasets(forceUpdate);
  //   const [data2, total2] = await browseDatasets(null, forceUpdate);
  //   setState({
  //     ...state,
  //     myDatasets: data1,
  //     myDatasetsTotal: total1,
  //     datasets: data2,
  //     datasetsTotal: total2,
  //     datasetSearchText: '',
  //     loading: false
  //   });
  // }

  const getFavorites = async (forceUpdate: boolean = false): Promise<Favorite[] | null> => {
    if (!forceUpdate && state.favorites && state.favorites.length > 0) {
      return state.favorites;
    }

    setState((prevState) => ({
      ...prevState,
      loading: true
    }));
    const data = await Datasets.getFavorites();
    setState((prevState) => ({
      ...prevState,
      favorites: data,
      loading: false
    }));
    return data;
  };

  const addFavorite = async (datasetId: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Datasets.addFavorite(datasetId);

    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    if (result) {
      getFavorites(true);
      return null;
    }
    return message;
  };

  const deleteFavorite = async (datasetId: any): Promise<string | null> => {
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    const [result, message] = await Datasets.deleteFavorite(datasetId);

    setState((prevState) => ({
      ...prevState,
      loading: false
    }));
    
    if (result) {
      getFavorites(true);
      return null;
    }
    return message;
  };

  const isFavorite = async (datasetId: any): Promise<boolean> => {
    let fav = null;

    if (state.favorites == null || state.favorites?.length == 0) {
      const favorites = await getFavorites(true);
      fav = favorites?.find((f) => f.dataset?.id == datasetId);
      return fav?.id ? true : false;
    }
      
    setState((prevState) => ({
      ...prevState,
      loading: true
    }));

    fav = state.favorites?.find((f) => f.dataset?.id == datasetId);

    setState((prevState) => ({
      ...prevState,
      loading: false
    }));

    return fav?.id ? true : false;
  };

  return (
    <DatasetContext.Provider value={{
      datasetState: state,
      clearState,
      browseDatasets,
      browseDataset,
      getMyDatasets,
      getMyDataset,
      createDataset,
      updateDataset,
      deleteDataset,
      getFavorites,
      isLoading,
      addFavorite,
      deleteFavorite,
      isFavorite
    }}>
      {props.children}
    </DatasetContext.Provider>
  );
};

export function useDataset() {
  return useContext(DatasetContext);
}
