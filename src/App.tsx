import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppRoutes from './routing/AppRoutes';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentRouteIndex = AppRoutes.find((x) => x.route === location.pathname)!.index;

  return (
    <>
      <div className="components-container">
        <button
          className="main-btn left-main-btn"
          onClick={() => {
            navigate(AppRoutes.find((x) => x.index === currentRouteIndex - 1)!.route);
          }}
        >
          Previous
        </button>
        <Routes>
          {AppRoutes.map((route) => (
            <Route key={route.key} path={route.route} element={route.view} />
          ))}
        </Routes>
        <button
          className="main-btn right-main-btn"
          onClick={() => {
            navigate(AppRoutes.find((x) => x.index === currentRouteIndex + 1)!.route);
          }}
        >
          Next
        </button>
      </div>
    </>
  );
}

export default App;
