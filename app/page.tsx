// import {Hero} from '@/components/home/home_1_hero/Hero';
// import {ProgramIntro} from '@/components/home/home_2_intro/ProgramIntro';
//
// import {QuickActionButtons} from '@/components/home/QuickActionButtons';
import {RecentlyCompletedProjects} from '@/components/home/RecentlyCompletedProjects';
import {ProjectsMapWithParallax} from '@/components/home/ProjectsMapWithParallax';
import {InvestmentAreas} from '@/components/home/InvestmentAreas';
import {Hero_V2} from "@/components/home/hero2/Hero_V2";

export default function Home() {
    return (
        <>
            <main className="flex flex-col gap-4">

                <section>
                    {/*<Hero/>*/}

                    <Hero_V2/>
                </section>
                <div className="flex flex-col gap-4 ">

                    <section className="w-full pl-6 max-w-7xl mx-auto">
                        <RecentlyCompletedProjects/>
                    </section>


                    <section >
                        <ProjectsMapWithParallax/>
                    </section>

                    <section className="px-6 w-full max-w-7xl mx-auto">
                        <InvestmentAreas/>
                    </section>

                </div>

            </main>


        </>
    );
}