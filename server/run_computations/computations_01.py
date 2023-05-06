import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import json
import sys
import os

PLOT_IMAGES_DIR = './dataset_plot_images/'

def check_plot_images_dir():
    '''
    Check if plot images directory exists and create if needed
    '''
    exists = os.path.exists(PLOT_IMAGES_DIR)
    if not exists:
        os.makedirs(PLOT_IMAGES_DIR)


def main():
    if len(sys.argv) < 3:
        print('Usage: computations_01.py csv_file computation [variable_name]')
        print('Computation available: mean, info, total_rows, columns, describe, value_counts, missing_values, histogram_plot, scatter_plot, groupby_average_plot, two_variables_plot')
        return

    check_plot_images_dir()

    csv_file = sys.argv[1]
    computation_name = sys.argv[2]
    if len(sys.argv) == 4:
        var_name = sys.argv[3]

    df = pd.read_csv(csv_file)

    if computation_name == 'info':
        print('Computation: Info')
        print(df.info())
    elif computation_name == 'total_rows':
        print(len(df))
    elif computation_name == 'columns':
        columns = df.dtypes.to_dict()
        result = []
        for col_name, typ in columns.items():
            typ = str(typ).replace('dtyle(\'', '').replace('\')', '')
            result.append({'name': col_name, 'type': typ})
        print(json.dumps(result))
    elif computation_name == 'describe':
        print('Computation: Describe')
        with pd.option_context('display.max_columns', 10000):
            print(df.describe(include='all'))
    elif computation_name == 'value_counts':
        print('Computation: Value Counts')
        print(df.value_counts())
    elif computation_name == 'missing_values':
        print('Computation: Missing Values')
        print(df.isnull().sum())
    elif computation_name == 'mean_all':
        print('Computation: Mean on variable:', var_name)
        if var_name == '':
            print('No variable informed.')
            return
        print(df[var_name].mean())
    elif computation_name == 'mean':
        print('Computation: Mean on variable:', var_name)
        if var_name == '':
            print('No variable informed.')
            return
        print(df[var_name].mean())
    elif computation_name == 'std_all':
        print('Computation: Standard deviation on all variables')
        print(df.std())
    elif computation_name == 'std':
        print('Computation: Standard deviation on variable:', var_name)
        if var_name == '':
            print('No variable informed.')
            return
        print(df[var_name].std())
    elif computation_name == 'histogram_plot':
        print('Computation: Histogram plot on variable:', var_name)
        if var_name == '':
            print('No variable informed.')
            return
        df[var_name].plot(kind='hist', bins=30, figsize=(12,8), title='Histogram\nVariable: ' + var_name)
        var_name_clean = var_name.replace(' ', '_')
        filename = f'{computation_name}_{var_name_clean}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
        plt.savefig(PLOT_IMAGES_DIR + filename)
        print('Saved plot: ' + filename)
    elif computation_name == 'scatter_plot':
        print('Computation: Scatter plot on variables:', var_name)
        if var_name == '' or var_name.find(',') < 0:
            print('Need two variables (separated by comma).')
            return
        variables = var_name.split(',')
        df.plot(x=variables[0], y=variables[1], kind='scatter', figsize=(12,8), title='Scatter\nVariables: ' + var_name)
        var_name_clean = var_name.replace(',', '_').replace(' ', '_')
        filename = f'{computation_name}_{var_name_clean}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
        plt.savefig(PLOT_IMAGES_DIR + filename)
        print('Saved plot: ' + filename)
    elif computation_name == 'groupby_average_plot':
        print('Computation: Average grouped by on variables:', var_name)
        if var_name == '' or var_name.find(',') < 0:
            print('Need two variables (separated by comma).')
            return
        variables = var_name.split(',')
        val = df.groupby(variables[0])[variables[1]].mean()
        print(val)
        val.plot(x=variables[0], y=variables[1], kind='bar', figsize=(12,8), title=f'Average {variables[1]} grouped by {variables[0]}')
        var_name_clean = var_name.replace(',', '_').replace(' ', '_')
        filename = f'{computation_name}_{var_name_clean}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
        plt.savefig(PLOT_IMAGES_DIR + filename)
        print('Saved plot: ' + filename)
    elif computation_name == 'two_variables_plot':
        print('Computation: Two variables plot on variables:', var_name)
        if var_name == '' or var_name.find(',') < 0:
            print('Need two variables (separated by comma).')
            return
        variables = var_name.split(',')
        df.plot(x=variables[0], y=variables[1], figsize=(12,8), title='Two Variables Plot\nVariables: ' + var_name)
        var_name_clean = var_name.replace(',', '_').replace(' ', '_')
        filename = f'{computation_name}_{var_name_clean}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
        plt.savefig(PLOT_IMAGES_DIR + filename)
        print('Saved plot: ' + filename)

if __name__ == "__main__":
    main()