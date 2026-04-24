//app/projects/page.tsx


import { Suspense } from 'react';
import { ProjectsPage } from '@/components/projects_page/ProjectsPage';

export default function ProjectsRoute() {
    return (
        <Suspense fallback={null}>
            <ProjectsPage />
        </Suspense>
    );
}