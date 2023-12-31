import { Home } from '../components/Home';
import { InteractiveRating } from '../components/solutions/interactive-rating/InteractiveRating';
import { ResultsSummary } from '../components/solutions/results-summary-component-main/components/ResultsSummary';

interface AppRoute {
  key: number;
  index: number;
  route: string;
  view: JSX.Element;
  isIndexRoute: boolean;
}

const AppRoutes: AppRoute[] = [
  {
    key: 0,
    index: 0,
    route: '/demos/',
    view: <Home />,
    isIndexRoute: true,
  },
  {
    key: 1,
    index: 1,
    route: '/interactive-rating/',
    view: <InteractiveRating />,
    isIndexRoute: false,
  },
  {
    key: 2,
    index: 2,
    route: '/results-summary/',
    view: <ResultsSummary />,
    isIndexRoute: false,
  },
];

export default AppRoutes;
