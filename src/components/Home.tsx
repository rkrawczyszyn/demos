import { useNavigate } from 'react-router-dom';
import AppRoutes from '../routing/AppRoutes';

export const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(AppRoutes[1].route);
  };

  return <button onClick={handleClick}>Start journeu</button>;
};
