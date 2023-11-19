import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppRoutes from './routing/AppRoutes';
import { useEffect, useState } from 'react';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [backBtnDisabled, setBackBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

  useEffect(() => {
    const currentRouteIndex = AppRoutes.find((x) => x.route === location.pathname)?.index;
    setBackBtnDisabled(currentRouteIndex === 0);
    setNextBtnDisabled(currentRouteIndex === AppRoutes.length - 1);
  });

  return (
    <>
      <div className="components-container">
        <button
          className="main-btn left-main-btn"
          onClick={() => {
            const currentRouteIndex = AppRoutes.find((x) => x.route === location.pathname)!.index;
            navigate(AppRoutes.find((x) => x.index === currentRouteIndex - 1)!.route);
          }}
          disabled={backBtnDisabled}
          style={backBtnDisabled ? { backgroundColor: '#8080805c', color: '#00000080' } : {}}
        >
          Previous
        </button>
        <Routes>
          <Route index element={<Navigate to="/demos/" replace />} />
          {AppRoutes.map((route) => (
            <Route key={route.key} index={route.isIndexRoute} path={route.route} element={route.view} />
          ))}
        </Routes>
        <button
          className="main-btn right-main-btn"
          onClick={() => {
            const currentRouteIndex = AppRoutes.find((x) => x.route === location.pathname)!.index;
            navigate(AppRoutes.find((x) => x.index === currentRouteIndex + 1)!.route);
          }}
          disabled={nextBtnDisabled}
          style={nextBtnDisabled ? { backgroundColor: '#8080805c', color: '#00000080' } : {}}
        >
          Next
        </button>
      </div>
    </>
  );
}

export default App;
