import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
function App() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URI}/api/hindu`,
        );
        console.log("res: ", res?.data);
        setNews(res?.data?.items || []);
        setLoading(false);
      } catch (error) {
        console.log("error: ", error?.response);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);
if (loading) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="mt-3 text-gray-700 font-medium">Loading...</div>
      </div>
    </div>
  );
}
  const toggleBookmark = (link) => {
    setFavorites((prev) => {
      let updated;

      if (prev.includes(link)) {
        updated = prev.filter((l) => l !== link);
      } else {
        updated = [...prev, link];
      }

      localStorage.setItem("favorites", JSON.stringify(updated));
      return updated;
    });
  };
  // const toggleBookmark = async (n) => {
  //   try {
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_API_URI}/api/favorite`,
  //       n,
  //     );
  //     console.log("tick: ", res?.data);
  //     setNews((prev) =>
  //       prev.map((item) =>
  //         item.link === n.link ? { ...item, favorite: !item.favorite } : item,
  //       ),
  //     );
  //   } catch (err) {
  //     console.log("tick error: ", err?.response);
  //   }
  // };
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-2 text-center text-black">
        The Hindu News
      </h1>
      <p className="mb-6 text-center text-black">Kanha Gupta</p>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {news?.map((n, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition duration-300 flex flex-col justify-between"
          >
            <div className="flex justify-between">
              <div className="text-xs text-blue-500 font-semibold mb-2">
                {n?.tags?.length ? n.tags.join(", ") : "No Tags"}
              </div>
              <button
                onClick={() => toggleBookmark(n?.link)}
                className="w-fit p-1 rounded-full  transition bg-transparent border-none"
              >
                {favorites.includes(n?.link) ? (
                  <FaBookmark className="text-red-500 text-xl" />
                ) : (
                  <FaRegBookmark className="text-gray-400 text-xl hover:text-red-500 transition" />
                )}
              </button>
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
