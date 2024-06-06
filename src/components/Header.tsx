import { useCallback, useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Search } from "./Search";

export const Header = ({ displayName }: { displayName: string }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState<boolean>(false);
    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.ctrlKey && (event.key === 'k' || event.key === 'K')) {
            event.preventDefault();
            setSearch(true);
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        }
    }, [])

    return (<>
        {/* Search Component */}
        {search && <Search onHide={() => setSearch(false)} />}

        <header>
            <h1 className="user_name">Hey {displayName}!</h1>
            <button onClick={() => setSearch(true)} className="search">Search user..
                <span><kbd>Ctrl+K</kbd></span>
            </button>
            <button className="search_icon" onClick={() => setSearch(true)}>
                <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
            </button>

            <button className="logout" onClick={async () => {
                await auth.signOut()
                localStorage.clear();
                navigate("/login");
            }}>Sign Out</button>
        </header>
    </>
    );
}