import TopNavbarAuth from "./TopNavbarAuth.jsx";
import TopNavbarMain from "./TopNavbarMain.jsx";
import { useAppContext } from "../context/AppContext.jsx";

export default function TopNavbar({
  toggleThemeMode,
  handleLanguageChange,
  pendingLatestNews,
  handleApplyLatestNews,
  increaseTextScale,
  decreaseTextScale,
}) {
  const {
    authScreen,
    setAuthScreen,
    pendingFavoriteArticle,
    setPendingFavoriteArticle,
    setActiveView,
    token,
    isDarkMode,
    preferredLanguage,
    textScale,
  } = useAppContext();

  return authScreen ? (
    <TopNavbarAuth
      setAuthScreen={setAuthScreen}
      pendingFavoriteArticle={pendingFavoriteArticle}
      setPendingFavoriteArticle={setPendingFavoriteArticle}
      token={token}
      setActiveView={setActiveView}
    />
  ) : (
    <TopNavbarMain
      toggleThemeMode={toggleThemeMode}
      handleLanguageChange={handleLanguageChange}
      pendingLatestNews={pendingLatestNews}
      handleApplyLatestNews={handleApplyLatestNews}
      isDarkMode={isDarkMode}
      preferredLanguage={preferredLanguage}
      textScale={textScale}
      decreaseTextScale={decreaseTextScale}
      increaseTextScale={increaseTextScale}
    />
  );
}
