// resources/js/pages/Admin/Stufaps/Partials/TesGrid.tsx
import React, { useRef, useEffect, useState } from 'react';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.css';

import { Button } from '@/components/ui/button';
import axios from 'axios';

// Register all Handsontable modules
registerAllModules();

const TesGrid = () => {
    const hotTableRef = useRef(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get(route('stufaps.tes-data'));
            setData(response.data);
        } catch (error) {
            console.error('Error fetching TES data:', error);
        }
    };

    const saveData = async () => {
        const hot = hotTableRef.current.hotInstance;
        const updatedData = hot.getData();

        try {
            await axios.post(route('stufaps.update-tes-data'), updatedData);
            alert('TES data saved successfully!');
        } catch (error) {
            console.error('Error saving TES data:', error);
            alert('Error saving TES data. Please check the console for details.');
        }
    };

    const columns = [
        { data: 'scholar.award_number', title: 'Award Number', readOnly: true },
        { data: 'scholar.family_name', title: 'Family Name', readOnly: true },
        { data: 'scholar.given_name', title: 'Given Name', readOnly: true },
        { data: 'tes_award_no', title: 'TES Award No.' },
        { data: 'disability', title: 'Disability' },
        { data: 'tes_application_status', title: 'Application Status' },
        { data: 'ay_batch', title: 'A.Y. Batch' },
        { data: 'remarks', title: 'Remarks' },
    ];

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={saveData}>Save Changes</Button>
            </div>
            <HotTable
                ref={hotTableRef}
                data={data}
                columns={columns}
                rowHeaders={true}
                colHeaders={columns.map(col => col.title)}
                height="auto"
                licenseKey="non-commercial-and-evaluation"
                stretchH="all"
                manualColumnResize={true}
                manualRowResize={true}
                contextMenu={true}
                filters={true}
                dropdownMenu={true}
            />
        </div>
    );
};

export default TesGrid;

function route(arg0: string): string {
    throw new Error('Function not implemented.');
}
