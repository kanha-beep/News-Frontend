import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URI}/api/hindu`,
        );
        console.log("res: ", res?.data);
        setNews(res?.data || []);
        setLoading(false);
      } catch (error) {
        console.log("error: ", error?.response);
      } finally {
        setLoading(true);
      }
    };
    fetchNews();
  }, []);
  if (loading) {
    <div className="grid place-items-center h-screen w-full bg-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }
  const toggleBookmark = async (n) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URI}/api/favorite`, n);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-2 text-center text-black">
        The Hindu News
      </h1>
      <p className="mb-6 text-center text-black">Kanha Gupta</p>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {news?.items?.map((n, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition duration-300 flex flex-col justify-between"
          >
            <div className="text-xs text-blue-500 font-semibold mb-2">
              {n?.tags?.length ? n.tags.join(", ") : "No Tags"}
            </div>
            <div className="text-xs text-gray-500/50 font-semibold mb-2">
              {n?.pubDate}
            </div>

            <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-black">
              {n?.title}
            </h2>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {n?.description}
            </p>
            <button onClick={() => toggleBookmark({link:n?.link})}>
              {n.favorite ? (
                <FaBookmark className="text-blue-600 text-lg" />
              ) : (
                <FaRegBookmark className="text-gray-400 text-lg" />
              )}
            </button>
            <a
              href={n?.link}
              target="_blank"
              className="mt-auto inline-block text-sm text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
            >
              Read Article
            </a>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-black">
        All credit goes to The Hindu API URL
      </p>
    </div>
  );
}

export default App;
