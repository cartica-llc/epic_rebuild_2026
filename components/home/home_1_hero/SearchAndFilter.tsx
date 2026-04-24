'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ActiveFilter = {
    label: string;
    value: string;
};

export function SearchAndFilter() {
    const [showFilters, setShowFilters] = useState(false);
    const [showAppliedFilters, setShowAppliedFilters] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [investmentArea, setInvestmentArea] = useState('');
    const [projectType, setProjectType] = useState('');
    const [developmentStage, setDevelopmentStage] = useState('');
    const [status, setStatus] = useState('');
    const [contractMin, setContractMin] = useState('');
    const [contractMax, setContractMax] = useState('');
    const [programAdmin, setProgramAdmin] = useState('');
    const [investmentPeriod, setInvestmentPeriod] = useState('');
    const [cpucProceedings, setCpucProceedings] = useState('');
    const [businessClass, setBusinessClass] = useState('');
    const [utilityService, setUtilityService] = useState('');
    const [assemblyDistrict, setAssemblyDistrict] = useState('');
    const [senateDistrict, setSenateDistrict] = useState('');

    const [standards, setStandards] = useState(false);
    const [cybersecurity, setCybersecurity] = useState(false);
    const [energyData, setEnergyData] = useState(false);
    const [communityBenefits, setCommunityBenefits] = useState(false);
    const [confidential, setConfidential] = useState(false);
    const [disadvantaged, setDisadvantaged] = useState(false);
    const [lowIncome, setLowIncome] = useState(false);

    const activeFilters = useMemo<ActiveFilter[]>(() => {
        const filters: ActiveFilter[] = [];

        if (searchKeyword) filters.push({ label: 'Search', value: searchKeyword });
        if (investmentArea) filters.push({ label: 'Investment Area', value: investmentArea });
        if (projectType) filters.push({ label: 'Project Type', value: projectType });
        if (developmentStage) filters.push({ label: 'Development Stage', value: developmentStage });
        if (status) filters.push({ label: 'Status', value: status });
        if (contractMin) filters.push({ label: 'Min Contract', value: contractMin });
        if (contractMax) filters.push({ label: 'Max Contract', value: contractMax });
        if (programAdmin) filters.push({ label: 'Program Admin', value: programAdmin });
        if (investmentPeriod) filters.push({ label: 'Investment Period', value: investmentPeriod });
        if (cpucProceedings) filters.push({ label: 'CPUC Proceedings', value: cpucProceedings });
        if (businessClass) filters.push({ label: 'Business Class', value: businessClass });
        if (utilityService) filters.push({ label: 'Utility Service', value: utilityService });
        if (assemblyDistrict) filters.push({ label: 'Assembly District', value: assemblyDistrict });
        if (senateDistrict) filters.push({ label: 'Senate District', value: senateDistrict });
        if (standards) filters.push({ label: 'Standards', value: 'Yes' });
        if (cybersecurity) filters.push({ label: 'Cybersecurity', value: 'Yes' });
        if (energyData) filters.push({ label: 'Energy Data', value: 'Yes' });
        if (communityBenefits) filters.push({ label: 'Community Benefits', value: 'Yes' });
        if (confidential) filters.push({ label: 'Confidential', value: 'Yes' });
        if (disadvantaged) filters.push({ label: 'Disadvantaged', value: 'Yes' });
        if (lowIncome) filters.push({ label: 'Low Income', value: 'Yes' });

        return filters;
    }, [
        searchKeyword,
        investmentArea,
        projectType,
        developmentStage,
        status,
        contractMin,
        contractMax,
        programAdmin,
        investmentPeriod,
        cpucProceedings,
        businessClass,
        utilityService,
        assemblyDistrict,
        senateDistrict,
        standards,
        cybersecurity,
        energyData,
        communityBenefits,
        confidential,
        disadvantaged,
        lowIncome,
    ]);

    const filterCount = activeFilters.length;
    const hasActiveFilters = filterCount > 0;

    const handleReset = () => {
        setSearchKeyword('');
        setInvestmentArea('');
        setProjectType('');
        setDevelopmentStage('');
        setStatus('');
        setContractMin('');
        setContractMax('');
        setProgramAdmin('');
        setInvestmentPeriod('');
        setCpucProceedings('');
        setBusinessClass('');
        setUtilityService('');
        setAssemblyDistrict('');
        setSenateDistrict('');
        setStandards(false);
        setCybersecurity(false);
        setEnergyData(false);
        setCommunityBenefits(false);
        setConfidential(false);
        setDisadvantaged(false);
        setLowIncome(false);
    };

    const handleRemoveFilter = (filterLabel: string) => {
        switch (filterLabel) {
            case 'Search':
                setSearchKeyword('');
                break;
            case 'Investment Area':
                setInvestmentArea('');
                break;
            case 'Project Type':
                setProjectType('');
                break;
            case 'Development Stage':
                setDevelopmentStage('');
                break;
            case 'Status':
                setStatus('');
                break;
            case 'Min Contract':
                setContractMin('');
                break;
            case 'Max Contract':
                setContractMax('');
                break;
            case 'Program Admin':
                setProgramAdmin('');
                break;
            case 'Investment Period':
                setInvestmentPeriod('');
                break;
            case 'CPUC Proceedings':
                setCpucProceedings('');
                break;
            case 'Business Class':
                setBusinessClass('');
                break;
            case 'Utility Service':
                setUtilityService('');
                break;
            case 'Assembly District':
                setAssemblyDistrict('');
                break;
            case 'Senate District':
                setSenateDistrict('');
                break;
            case 'Standards':
                setStandards(false);
                break;
            case 'Cybersecurity':
                setCybersecurity(false);
                break;
            case 'Energy Data':
                setEnergyData(false);
                break;
            case 'Community Benefits':
                setCommunityBenefits(false);
                break;
            case 'Confidential':
                setConfidential(false);
                break;
            case 'Disadvantaged':
                setDisadvantaged(false);
                break;
            case 'Low Income':
                setLowIncome(false);
                break;
            default:
                break;
        }
    };

    const handleApplySearch = () => {
        console.log('Search submitted with filters');
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleApplySearch();
    };

    useEffect(() => {
        if (showFilters) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }

        document.body.style.overflow = 'unset';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showFilters]);

    return (
        <div className="mx-auto w-full max-w-6xl">
            <AnimatePresence mode="wait">
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setShowFilters(false)}
                            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 top-0 z-50 w-[85vw] max-w-sm overflow-y-auto bg-white shadow-2xl"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                                <h3 className="text-lg font-bold text-slate-900">Filters</h3>

                                <motion.button
                                    type="button"
                                    onClick={() => setShowFilters(false)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-slate-600 transition-colors hover:text-slate-900"
                                >
                                    <X className="h-6 w-6" />
                                </motion.button>
                            </div>

                            <div className="p-6 pb-24">
                                <div className="space-y-5">
                                    <FilterSelect
                                        label="Investment Area"
                                        value={investmentArea}
                                        onChange={setInvestmentArea}
                                        options={[
                                            'Grid Modernization',
                                            'Energy Storage',
                                            'Renewable Integration',
                                            'Electric Vehicle Infrastructure',
                                            'Microgrids',
                                            'Transmission & Distribution',
                                            'Smart Grid Technology',
                                            'Demand Response',
                                        ]}
                                    />

                                    <FilterSelect
                                        label="Project Type"
                                        value={projectType}
                                        onChange={setProjectType}
                                        options={[
                                            'Infrastructure',
                                            'Research & Development',
                                            'Pilot Program',
                                            'Deployment',
                                            'Demonstration',
                                            'Planning & Assessment',
                                            'Technology Integration',
                                        ]}
                                    />

                                    <FilterSelect
                                        label="Development Stage"
                                        value={developmentStage}
                                        onChange={setDevelopmentStage}
                                        options={[
                                            'Planning',
                                            'Design',
                                            'Permitting',
                                            'Construction',
                                            'Testing & Commissioning',
                                            'Operational',
                                            'Completed',
                                            'On Hold',
                                        ]}
                                    />

                                    <FilterSelect label="Status" value={status} onChange={setStatus} options={[]} />
                                    <FilterSelect
                                        label="Program Administrator"
                                        value={programAdmin}
                                        onChange={setProgramAdmin}
                                        options={[]}
                                    />
                                    <FilterSelect
                                        label="Investment Period"
                                        value={investmentPeriod}
                                        onChange={setInvestmentPeriod}
                                        options={[]}
                                    />
                                    <FilterSelect
                                        label="CPUC Proceedings"
                                        value={cpucProceedings}
                                        onChange={setCpucProceedings}
                                        options={[]}
                                    />
                                    <FilterSelect
                                        label="Business Classification"
                                        value={businessClass}
                                        onChange={setBusinessClass}
                                        options={[]}
                                    />

                                    <SectionToggle label="Funding" />
                                    <TextInput
                                        label="Contract Amount (Min)"
                                        placeholder="$0"
                                        value={contractMin}
                                        onChange={setContractMin}
                                    />
                                    <TextInput
                                        label="Contract Amount (Max)"
                                        placeholder="$10,000,000"
                                        value={contractMax}
                                        onChange={setContractMax}
                                    />

                                    <SectionToggle label="Location" />
                                    <FilterSelect
                                        label="Utility Service Area"
                                        value={utilityService}
                                        onChange={setUtilityService}
                                        options={[]}
                                    />
                                    <FilterSelect
                                        label="Assembly District"
                                        value={assemblyDistrict}
                                        onChange={setAssemblyDistrict}
                                        options={[]}
                                    />
                                    <FilterSelect
                                        label="Senate District"
                                        value={senateDistrict}
                                        onChange={setSenateDistrict}
                                        options={[]}
                                    />

                                    <CheckboxGroup
                                        title="Attributes"
                                        items={[
                                            { label: 'Standards', checked: standards, onChange: setStandards },
                                            { label: 'Cybersecurity', checked: cybersecurity, onChange: setCybersecurity },
                                            { label: 'Energy Data', checked: energyData, onChange: setEnergyData },
                                            { label: 'Community Benefits', checked: communityBenefits, onChange: setCommunityBenefits },
                                            { label: 'Confidential', checked: confidential, onChange: setConfidential },
                                        ]}
                                    />

                                    <CheckboxGroup
                                        title="Community Focus"
                                        items={[
                                            { label: 'Disadvantaged', checked: disadvantaged, onChange: setDisadvantaged },
                                            { label: 'Low Income', checked: lowIncome, onChange: setLowIncome },
                                        ]}
                                    />
                                </div>
                            </div>

                            <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4">
                                <motion.button
                                    type="button"
                                    onClick={handleReset}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 transition-all hover:bg-slate-50"
                                >
                                    Reset
                                </motion.button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
                <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 p-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="w-full border-0 bg-transparent py-3 pl-12 pr-4 text-lg text-slate-700 focus:outline-none"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>

                        <motion.button
                            type="button"
                            onClick={() => setShowFilters((prev) => !prev)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-2 rounded-lg px-4 py-3 font-semibold transition-all ${
                                showFilters ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </motion.button>
                    </div>
                </div>
            </form>

            <AnimatePresence>
                {hasActiveFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between p-4 hover:bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => setShowAppliedFilters((prev) => !prev)}
                                className="flex flex-1 items-center justify-between"
                            >
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1 text-sm font-semibold text-white">
                    {filterCount} {filterCount === 1 ? 'Filter' : 'Filters'}
                  </span>
                </span>

                                <motion.div
                                    animate={{ rotate: showAppliedFilters ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="h-5 w-5 text-slate-600" />
                                </motion.div>
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="ml-3 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Clear all filters"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showAppliedFilters && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-t border-slate-200/60"
                                >
                                    <div className="space-y-3 p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {activeFilters.map((filter, index) => (
                                                <motion.div
                                                    key={`${filter.label}-${index}`}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5"
                                                >
                                                    <span className="text-sm font-medium text-slate-700">{filter.label}:</span>
                                                    <span className="text-sm text-slate-600">{filter.value}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFilter(filter.label)}
                                                        className="ml-2 text-slate-500 hover:text-slate-700"
                                                        aria-label={`Remove ${filter.label} filter`}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <motion.button
                                            type="button"
                                            onClick={handleApplySearch}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="w-full rounded-lg bg-slate-700 px-4 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-slate-800"
                                        >
                                            Submit
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

type FilterSelectProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
};

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
            <div className="relative">
                <select
                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">Select...</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
    );
}

type TextInputProps = {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
};

function TextInput({ label, placeholder, value, onChange }: TextInputProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-700 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

function SectionToggle({ label }: { label: string }) {
    return (
        <div>
            <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
            >
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
        </div>
    );
}

type CheckboxGroupItem = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};

type CheckboxGroupProps = {
    title: string;
    items: CheckboxGroupItem[];
};

function CheckboxGroup({ title, items }: CheckboxGroupProps) {
    return (
        <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-700">{title}</h4>
            <div className="space-y-2.5">
                {items.map((item) => (
                    <label key={item.label} className="group flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-700 focus:ring-slate-400"
                            checked={item.checked}
                            onChange={(e) => item.onChange(e.target.checked)}
                        />
                        <span className="text-sm text-slate-700 group-hover:text-slate-900">{item.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}