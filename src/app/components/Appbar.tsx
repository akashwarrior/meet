'use client'

import { signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { Search } from "./Search";

const Appbar = ({ name }: { name: string }) => {
    const [search, setSearch] = useState<boolean>(false);
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.ctrlKey && event.code === 'KeyK') {
            event.preventDefault();
            setSearch(true);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        }
    }, [handleKeyPress])

    return <>
        {/* Search Component */}
        {search && <Search onHide={() => setSearch(false)} />}

        <header className="w-full h-16 flex fixed bg-[#000000cc] top-0 justify-between items-center px-4 shadow-[inset_0_-1px_0_0_#333] backdrop-blur-[6px] backdrop-saturate-[180%] z-10">
            <h1 className="text-white text-xl font-semibold flex-1">Hey {name}!</h1>
            <button
                onClick={() => setSearch(true)}
                className="bg-[#1a1a1a] outline-hidden cursor-pointer border-none flex items-center justify-between min-w-[237px] rounded-md px-3 text-[#8f8f8f] h-8 transition-all duration-150 hover:bg-[#262626] hover:text-white"
            >
                Search user..
                <span className="h-5 rounded-md px-2 text-[#ededed] bg-[#0a0a0a] font-semibold ml-4 shadow-[0_0_0_1px_rgba(255,255,255,0.145)] border-none text-sm"><kbd>Ctrl+K</kbd></span>
            </button>
            <button
                onClick={() => signOut()}
                className="hover:outline ml-10 px-5 py-1.5 rounded-md transition-all duration-100 hover:shadow-[0_0_15px_5px_rgba(255,116,50,0.8)]"
            >
                Sign Out
            </button>
        </header >
    </>
}

export default Appbar;