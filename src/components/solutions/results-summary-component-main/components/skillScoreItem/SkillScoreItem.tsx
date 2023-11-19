import { PropsWithChildren, useEffect, useState } from 'react';

// import './../../styles/main.scss';
import './styles.scss';

type Props = {
  logo: string;
  name: string;
  score: number;
  primaryColor: string;
};

export const SkillScoreItem = (props: PropsWithChildren<Props>): JSX.Element => {
  const { logo, name, score, primaryColor } = props;

  const [fontClass, setFontClass] = useState<string>('skill-name');

  // todor to nadaje sie na refactor. okropne ify...
  useEffect(() => {
    if (primaryColor === 'red') {
      setFontClass('skill-name red-font-clr');
    }
    if (primaryColor === 'yellow') {
      setFontClass('skill-name yellow-font-clr');
    }
    if (primaryColor === 'green') {
      setFontClass('skill-name green-font-clr');
    }
    if (primaryColor === 'purple') {
      setFontClass('skill-name purple-font-clr');
    }
  }, []);

  let bckColorClass = '';
  if (primaryColor === 'red') {
    bckColorClass = 'red-background';
    // setFontClass('skill-name red-font-clr');
  }
  if (primaryColor === 'yellow') {
    bckColorClass = 'yellow-background';
  }
  if (primaryColor === 'green') {
    bckColorClass = 'green-background';
  }
  if (primaryColor === 'purple') {
    bckColorClass = 'purple-background';
  }

  return (
    <li className={bckColorClass}>
      <div className="skill-container">
        <img src={logo} alt="Missing Logo" />
        <span className={fontClass}>{name}</span>
      </div>
      {/* todor refactor - move to external component, since it's 4 times the same style */}
      <div className="skill-score-container">
        <span className="score">{score} </span>
        <span className="out-of-score">/ 100</span>
      </div>
    </li>
  );
};
