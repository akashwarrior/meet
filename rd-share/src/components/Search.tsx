import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Search.css';

export const Search = ({ onHide, displayName, uid }: { onHide: any, displayName: string, uid: string }) => {
    const navigation = useNavigate();
    const [worker, setWorker] = useState<Worker | null>(null);
    const [searchInpt, setSearchInpt] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const webWoker = new Worker(new URL('../app/peerRequestingWoker.ts', import.meta.url), { type: 'module' });
        setWorker(webWoker);

        webWoker.onmessage = ({ data }) => {
            const { type } = data;
            switch (type) {
                case 2:
                    setLoading(false);
                    alert("User not found.");
                    break;
                case 3:
                    setSearchInpt(val => {
                        navigation('/room?id=' + val);
                        return val;
                    })
                    break;
                case 4:
                    setLoading(false);
                    alert("User is offline.");
                    break;
                case 5:
                    setLoading(false);
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

    useEffect(() => {
        if (searchInpt.length == 6) {
            handleSearch(searchInpt);
        }
    }, [searchInpt])

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            onHide();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            setSearchInpt(val => {
                if (val.length == 6)
                    handleSearch(val);
                return val;
            })
        }
    };

    const handleSearch = (searchQuery: string) => {
        setLoading(true);
        const value = searchQuery;
        let res = '';
        for (let i = 0; i < value.length; i++) {
            if (value[i] === '-') {
                continue;
            }
            res += value[i];
        }
        if (res === uid) {
            setLoading(false);
            alert("You can't connect with yourself.");
            return;
        }
        setWorker(worker => {
            worker?.postMessage({ type: 0, roomID: res, displayName, uid });
            return worker;
        })
    };


    return (
        <section className="searchSec">
            <span className="searchSec_bg"></span>
            <div>
                <input
                    type="search"
                    maxLength={6}
                    onChange={e => setSearchInpt(e.target.value)}
                    placeholder="Enter User ID..."
                    autoFocus
                    {...loading && { disabled: true }}
                />
                <button onClick={onHide}>Esc</button>
            </div>
            {loading && <span className="loading" >Loading...</span>}
        </section >
    );
};