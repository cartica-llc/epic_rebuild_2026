import FAQAccordion from "@/components/faq/FAQAccordion";

export const metadata = {
    title: "FAQ — EPIC Database",
    description:
        "Frequently asked questions about the Electric Program Investment Charge (EPIC) and the EPIC Database.",
};

export default function FAQPage() {
    return (
        <main className=" max-w-[1600px] mx-auto py-12 px-4">

                <FAQAccordion />

        </main>
    );
}