// app/projects/[id]/page.tsx

import { ProjectDetailPage } from '@/components/project_detail_page/ProjectDetailPage';

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProjectDetailRoute({ params }: PageProps) {
    const { id } = await params;
    return <ProjectDetailPage projectId={id} />;
}