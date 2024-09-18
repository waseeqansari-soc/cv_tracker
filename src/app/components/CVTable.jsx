'use client';

import { useState } from 'react';
import BasicTable from './Table';
import FormModal from './FormModal';

const CVTable = () => {
    const [shouldRerenderTable, setShouldRerenderTable] = useState(false);

    const handleApiResponse = () => {
        setShouldRerenderTable(prev => !prev);
    };
    return (
        <div>
            <BasicTable shouldRerenderTable={shouldRerenderTable} />
            <FormModal onApiResponse={handleApiResponse} name="Add" />
        </div>
    );
};

export default CVTable;
