/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const csv = require('csvtojson');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

export type DatasetVariable = {
  name: string;
  type: string;
};

export type DatasetInfo = {
  rows: any[] | null;
  variables: DatasetVariable[] | null;
};

export async function getDatasetInfo(directory, file, deleteFile = true): Promise<DatasetInfo> {
  try {
    const columnsOutput = await exec(`python3 ./run_computations/computations_01.py ${directory}/${file} columns`);
    const columns = JSON.parse(columnsOutput.stdout.trim());

    const rows = await csv().fromFile(`${directory}/${file}`);

    const datasetInfo: DatasetInfo = {
      rows: rows,
      variables: columns
    };

    if (deleteFile) removeFile(directory, file);

    return datasetInfo;
  } catch (err) {
    console.log(err);
    return {
      rows: null,
      variables: null
    };
  }
}

export function getFileContent(filePath): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.log('getFileContent Error:', e);
    return null;
  }
}

export function removeFile(directory, file) {
  try {
    fs.unlinkSync(directory + '/' + file);
  } catch (err) {
    console.log(err);
  }
}
