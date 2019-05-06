/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiComboBox } from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import { Datasource, DatasourcePanelProps, DatasourcePlugin, VisModel } from '../../../public';
import { FieldListPanel } from '../../common/components/field_list_panel';
import { getIndexPatterns } from './index_patterns';
import { toExpression } from './to_expression';

interface DataPanelState {
  indexPatterns: Datasource[];
}

function DataPanel(props: DatasourcePanelProps<VisModel>) {
  const { visModel, onChangeVisModel } = props;

  const [state, setState] = useState({ indexPatterns: [] } as DataPanelState);

  useEffect(() => {
    getIndexPatterns().then(loadedIndexPatterns => {
      if (!loadedIndexPatterns) {
        return;
      }

      setState({ indexPatterns: loadedIndexPatterns });

      onChangeVisModel({
        ...visModel,
        // TODO: There is a default index pattern preference that is being ignored here
        datasource: loadedIndexPatterns.length ? loadedIndexPatterns[0] : null,
      });
    });
  }, []);

  if (state.indexPatterns.length && !visModel.datasource) {
    onChangeVisModel({
      ...visModel,
      // TODO: There is a default index pattern preference that is being ignored here
      datasource: state.indexPatterns[0],
    });
  }

  const indexPatternsAsSelections = state.indexPatterns.map(({ title }) => ({
    label: title,
  }));

  return (
    <>
      <div className="lnsIndexPattern__select">
        <EuiComboBox
          options={indexPatternsAsSelections}
          singleSelection={{ asPlainText: true }}
          selectedOptions={indexPatternsAsSelections.filter(
            ({ label }) => visModel.datasource && label === visModel.datasource.title
          )}
          isClearable={false}
          onChange={([{ label }]) =>
            onChangeVisModel({
              ...visModel,
              datasource: state.indexPatterns.find(({ title }) => title === label) || null,
            })
          }
        />
      </div>
      <FieldListPanel {...props} />
    </>
  );
}

export const config: DatasourcePlugin<VisModel> = {
  name: 'index_pattern',
  toExpression,
  DataPanel,
  icon: 'indexPatternApp',
};