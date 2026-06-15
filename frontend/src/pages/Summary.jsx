import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { FaQuestion } from 'react-icons/fa';
import './css/Summary.css';

const Summary = () => {
    const location = useLocation();

    const summaryData = location.state?.response || [];
    const pdffile = location.state?.selectedFile;
    const tagsData = location.state?.tagData;
    const titleData = location.state?.title;
    const totalPages = location.state?.totalPages;

    const uniqueTags = [...new Set(tagsData)];

    const [summary, setSummary] = useState(summaryData);
    const [question, setQuestion] = useState('');
    const [qnans, setQnans] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pageno, setPageNo] = useState(0);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [nextPageText, setNextPageText] = useState("Next Page >");
    const [tourVisible, setTourVisible] = useState(true);

    const capitalizeTitle = (title) => {
        if (typeof title !== 'string') return '';
        return title
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    const title = capitalizeTitle(titleData);

    // ---------------- NEXT PAGE SUMMARY ----------------
    const handleNextPage = async () => {
        setSummaryLoading(true);

        try {
            const nextPage = pageno + 1;

            if (nextPage >= totalPages) {
                setNextPageText("End of PDF");
                setSummaryLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', pdffile);
            formData.append('page_no', nextPage);

            const res = await axios.post(
                'http://localhost:3000/get_summary',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            const pages = res.data?.responseText;

            console.log("GET_SUMMARY RESPONSE:", res.data);

            if (!Array.isArray(pages)) {
                setSummary([]);
                return;
            }

            const pageData = pages[nextPage];

            setPageNo(nextPage);
            setSummary(pageData?.summary || []);

        } catch (err) {
            console.error("Summary fetch failed:", err);
            setSummary([]);
        } finally {
            setSummaryLoading(false);
        }
    };

    // ---------------- ASK AI ----------------
    const askAIHandler = async () => {
        if (!question.trim()) return;

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', pdffile);
            formData.append('question', question);
            formData.append('page_no', pageno);

            const res = await axios.post(
                'http://localhost:3000/get_answer',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            const qnan = [
                question,
                res.data?.responseText || "No response"
            ];

            setQnans(prev => [qnan, ...prev]);
            setQuestion('');

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="tracking-wide md:mx-32 px-4 py-12 mt-20">

                {/* TITLE */}
                <div className="text-center">
                    <h1 className="summary-title text-4xl font-bold">
                        {title}
                    </h1>

                    <div className="tags mt-4 flex flex-wrap justify-center gap-2">
                        {uniqueTags?.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-200 rounded">
                                {tag?.replace(/"/g, '')}
                            </span>
                        ))}
                    </div>
                </div>

                {/* SUMMARY */}
                <div className="summary-content mt-10">
                    <h2 className="text-2xl font-bold">Summary</h2>

                    {summaryLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <ul className="list-disc ml-6 mt-4">
                            {Array.isArray(summary) &&
                                summary.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                        </ul>
                    )}

                    <div className="text-center mt-6">
                        Page: {pageno + 1}
                    </div>

                    <div className="flex justify-center mt-4">
                        <button
                            id="next-page"
                            onClick={handleNextPage}
                            className="bg-black text-white px-4 py-2 rounded"
                        >
                            Next Page &gt;
                        </button>
                    </div>
                </div>

                {/* ASK AI */}
                <div className="ask-ai mt-10">
                    <h2 className="text-2xl font-bold">Ask AI</h2>

                    <input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="border p-2 w-full mt-3"
                        placeholder="Ask something..."
                    />

                    <button
                        onClick={askAIHandler}
                        className="bg-black text-white px-4 py-2 mt-3"
                    >
                        Submit
                    </button>
                </div>

                {/* ANSWERS */}
                <div className="ai-answers mt-10">
                    <h2 className="text-2xl font-bold">Answers</h2>

                    {loading && <p>Loading answer...</p>}

                    {qnans.map((q, i) => (
                        <div key={i} className="border p-3 mt-3">
                            <b>{q[0]}</b>
                            <p>{q[1]}</p>
                        </div>
                    ))}
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default Summary;