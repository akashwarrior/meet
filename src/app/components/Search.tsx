'use client'

import { useCallback, useEffect, useRef, useState } from "react";
import { sendRequest } from "../lib/actions/sendReq";
import { useRouter } from "next/navigation";

export function Search({ onHide }: { onHide: () => void }) {
    const router = useRouter();
    const searchInpt = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const handleSearch = useCallback(async () => {
        const value = searchInpt.current?.value;
        if (!value || value.length < 6) {
            alert("ID is not valid");
            return;
        }

        setLoading(true);
        let res = '';
        for (let i = 0; i < value.length; i++) {
            if (value[i] === '-' || value[i] === '+') {
                continue;
            }
            res += value[i];
        }
        const response = await sendRequest(res);
        if (response.status) {
            router.push(`/room/${res}`);
        } else {
            alert(response.message);
            setLoading(false);
        }
    }, [router]);
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onHide();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    }, [handleSearch, onHide]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        }
    }, [handleKeyPress, handleSearch]);

    return (
        <section className="absolute flex items-center justify-center h-screen w-screen bg-transparent z-40 flex-col">
            <span className="absolute w-screen flex justify-center items-center h-screen z-50 bg-[#0a0a0a] opacity-80"></span>
            <div className="bg-[#0a0a0a] w-[640px] rounded-xl flex items-center justify-center z-50 max-w-[80%] border border-gray-800">
                <input
                    type="number"
                    className="text-lg text-[#ededed] border-none p-2.5 outline-hidden flex-1 bg-transparent"
                    ref={searchInpt}
                    onInputCapture={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9-+]/g, '');
                        if (e.currentTarget.value.length == 6) {
                            handleSearch();
                        }
                    }}
                    placeholder="Enter User ID..."
                    autoFocus
                    {...loading && { disabled: true }}
                />
                <button className="h-5 shadow-lg rounded-md bg-[#0a0a0a] px-2 py-3 border border-gray-800 flex items-center justify-center cursor-pointer outline-hidden text-white mr-3 ml-auto hover:bg-[#1a1a1a]" onClick={onHide}>Esc</button>
            </div>
            {loading && <span className="z-50 text-lg" >Loading...</span>}
        </section >
    );
}