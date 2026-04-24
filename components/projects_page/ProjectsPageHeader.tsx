interface ProjectsPageHeaderProps {
    viewParam: string | null;
}

export function ProjectsPageHeader({ viewParam }: ProjectsPageHeaderProps) {
    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
            <p className="mt-1 text-sm text-slate-600">
                Browse EPIC projects and quick insights{viewParam ? ` for "${viewParam}"` : ''}.
            </p>
        </div>
    );
}