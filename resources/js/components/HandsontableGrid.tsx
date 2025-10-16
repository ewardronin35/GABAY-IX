import React from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';

// Register all Handsontable modules
registerAllModules();

const HandsontableGrid = ({ data, columns, columnHeaders }) => {
  return (
    <HotTable
      data={data}
      columns={columns}
      colHeaders={columnHeaders}
      rowHeaders={true}
      height="auto"
      width="100%"
      stretchH="all"
      autoWrapRow={true}
      autoWrapCol={true}
      manualRowResize={true}
      manualColumnResize={true}
      filters={true}
      dropdownMenu={true}
      contextMenu={true}
      search={true}
      licenseKey="non-commercial-and-evaluation" // For non-commercial use
      className="hot-table"
    />
  );
};

export default HandsontableGrid;