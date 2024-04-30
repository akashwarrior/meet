import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Search = ({ onHide, displayName, uid }: { onHide: any, displayName: string, uid: string }) => {
    const navigation = useNavigate();
    const [worker, setWorker] = useState<Worker | null>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const webWoker = new Worker(new URL('../app/peerRequestingWoker.ts', import.meta.url), { type: 'module' });
        setWorker(webWoker);

        webWoker.onmessage = ({ data }) => {
            const { type } = data;
            switch (type) {
                case 2:
                    alert("User not found.");
                    break;
                case 3:
                    navigation('/room?id=' + searchRef.current?.value);
                    break;
                case 4:
                    alert("User is offline.");
                    break;
                case 5:
                    alert("User declined your request.");
                    break;
                default:
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            webWoker.terminate();
            worker?.terminate();
        }
    }, []);

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onHide();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };

    const handleSearch = () => {
        if (!searchRef.current) return;
        const value = searchRef.current.value;
        let res = '';
        for (let i = 0; i < value.length; i++) {
            if (value[i] === '-') {
                continue;
            }
            res += value[i];
        }
        setWorker(worker => {
            if (!worker) return worker;
            worker?.postMessage({ type: 0, roomID: res, displayName, uid });
            return worker;
        })
    };


    return (
        <section className="searchSec">
            <span className="searchSec_bg"></span>
            <div>
                <input type="search" ref={searchRef} placeholder="Enter User ID..." autoFocus />
                <button onClick={onHide}>Esc</button>
            </div>
        </section >
    );
};