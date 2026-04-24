import { Hero } from '@/components/home/home_1_hero/Hero';
import { ProgramIntro } from '@/components/home/home_2_intro/ProgramIntro';

// Add these back in when you migrate them:
// import { QuickActionButtons } from '@/components/home/...';
// import { RecentlyCompletedProjects } from '@/components/home/...';
// import { ProjectsMapWithParallax } from '@/components/home/...';
// import { InvestmentAreas } from '@/components/home/...';

export default function Home() {
    return (
        <>
            <Hero />

            <section className="px-6">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-8 md:flex-row md:items-center">
                    <div className="w-full md:w-1/2">
                        <ProgramIntro />
                    </div>

                    <div className="w-full md:w-1/2">
                        {/* Replace with your migrated component */}
                        {/* <QuickActionButtons /> */}
                    </div>
                </div>
            </section>

            {/* Add back as you migrate each one */}
            {/* <RecentlyCompletedProjects /> */}
            {/* <ProjectsMapWithParallax /> */}

            <section className="px-6">
                <div className="flex flex-col gap-8 lg:flex">
                    {/* <InvestmentAreas /> */}
                </div>
            </section>
        </>
    );
}