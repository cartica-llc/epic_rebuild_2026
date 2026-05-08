import { Hero } from '@/components/home/home_1_hero/Hero';
import { ProgramIntro } from '@/components/home/home_2_intro/ProgramIntro';

import { QuickActionButtons } from '@/components/home/QuickActionButtons';
import { RecentlyCompletedProjects } from '@/components/home/RecentlyCompletedProjects';
import { ProjectsMapWithParallax } from '@/components/home/ProjectsMapWithParallax';
import { InvestmentAreas } from '@/components/home/InvestmentAreas';

export default function Home() {
    return (
        <>
            <Hero />

            <section className="px-6">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-8 lg:flex-row lg:items-center">

                    <div className="w-full lg:w-1/2">
                        <ProgramIntro />
                    </div>

                    <div className="w-full lg:w-1/2">
                        <QuickActionButtons />
                    </div>
                </div>
            </section>

            <RecentlyCompletedProjects />
            <ProjectsMapWithParallax />

            <section className="px-6">
                <div className="flex flex-col gap-8 lg:flex">
                    <InvestmentAreas />
                </div>
            </section>
        </>
    );
}