import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import AppRoutes from './routing/AppRoutes';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // const [currentRouteIndex, setCurrentRouteIndex] = useState(second);

  return (
    <>
      <div className="components-container">
        <button
          className="main-btn left-main-btn"
          onClick={() => {
            const currentRouteIndex = AppRoutes.find((x) => x.route === location.pathname)!.index;
            navigate(AppRoutes.find((x) => x.index === currentRouteIndex - 1)!.route);
          }}
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
        >
          Next
        </button>
      </div>
    </>
  );
}

export default App;
