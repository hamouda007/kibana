/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiButton,
  // @ts-ignore
  EuiSuperSelect,
  EuiTextArea,
} from '@elastic/eui';
import React, { useState } from 'react';
import { Datasource, DatasourcePanelProps, DatasourcePlugin, VisModel } from '../../../public';
import { FieldListPanel } from '../../common/components/field_list_panel';

function DataPanel(props: DatasourcePanelProps<VisModel>) {
  const { visModel, onChangeVisModel } = props;
  const [text, updateText] = useState(visModel.datasource ? visModel.datasource.meta.text : '');

  const updateDatasource = async () => {
    const headerRow = text.split('\n')[0].split(',');
    const firstRow = text.split('\n')[1].split(',');
    const resultColumns: Array<{ name: string; type: 'number' | 'string' }> = headerRow.map(
      (columnHeader: string, index: number) => ({
        name: columnHeader,
        type: /\d+/.test(firstRow[index]) ? 'number' : 'string',
      })
    );

    const newDatasource: Datasource = {
      id: 'source',
      title: 'Literal csv',
      fields: resultColumns.map(({ name, type }) => ({
        name,
        type,
        aggregatable: false,
        searchable: false,
      })),
      meta: { text },
    };

    onChangeVisModel({ ...visModel, datasource: newDatasource });
  };

  return (
    <>
      <EuiTextArea
        style={{ height: 400 }}
        fullWidth
        placeholder="Enter your CSV file here"
        value={text}
        onChange={({ target: { value } }) => updateText(value)}
      />
      <EuiButton onClick={updateDatasource}>Apply</EuiButton>
      <FieldListPanel {...props} />
    </>
  );
}

function toExpression(viewState: VisModel) {
  if (Object.keys(viewState.queries).length === 0) {
    return '';
  }
  const firstQuery = Object.values(viewState.queries)[0];
  // TODO prob. do this on an AST object and stringify afterwards
  // return `sample_data`;
  return `literal_table keep='${
    viewState.datasource
      ? JSON.stringify(
          firstQuery.select.map(column => ('argument' in column ? column.argument.field : ''))
        )
      : '[]'
  }' columnNames='${
    viewState.datasource ? JSON.stringify(firstQuery.select.map(column => column.id)) : '[]'
  }' lines='${
    viewState.datasource ? JSON.stringify(viewState.datasource.meta.text.split('\n')) : '[]'
  }'`;
}

export const config: DatasourcePlugin<VisModel> = {
  name: 'csv',
  toExpression,
  DataPanel,
  icon: 'document',
};