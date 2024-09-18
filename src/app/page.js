// src/app/page.js

import CVTable from './components/CVTable';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export default function Home() {
  return (
    <div>
      <h1>CV Tracker</h1>
      <CVTable />
    </div>
  );
}
