// components/projects_page/insights/learnings/LearningsTopicChips.tsx

'use client';

import { STARTER_TOPICS } from './shared/types';

interface LearningsTopicChipsProps {
    activeTerm: string;
    onSelect: (topic: string) => void;
}

export function LearningsTopicChips({ activeTerm, onSelect }: LearningsTopicChipsProps) {
    return (
        <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Popular topics
            </p>
            <div className="flex flex-wrap gap-2">
                {STARTER_TOPICS.map((topic) => {
                    const isActive = activeTerm.toLowerCase() === topic.toLowerCase();
                    return (
                        <button
                            key={topic}
                            type="button"
                            onClick={() => onSelect(isActive ? '' : topic)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                                isActive
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            {topic}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
