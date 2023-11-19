import '../styles/main.scss';

import ReactionLogo from './../assets/images/icon-reaction.svg';
import MemoryLogo from './../assets/images/icon-memory.svg';
import VerbalLogo from './../assets/images/icon-verbal.svg';
import VisualLogo from './../assets/images/icon-visual.svg';
import { SkillScoreItem } from './skillScoreItem/SkillScoreItem';

export const ResultsSummary = () => {
  return (
    <>
      <div className="content-container">
        <div className="container-rsc">
          <div className="left">
            <h3 className="result-header font-weight-700">Your Result</h3>
            <div className="circle">
              <div className="score-container font-weight-700">
                <span className="score">76</span>
                <span className="out-of-score">of 100</span>
              </div>
            </div>
            <div className="container-summary">
              <h3 className="great-heading">Great</h3>
              <p className="para">You scored higher than 65% of the people who have taken these tests.</p>
            </div>
          </div>
          <div className="right">
            {/* <h3 className="summary-header">Summary</h3> */}
            <h3>Summary</h3>
            <ul className="score-list">
              <SkillScoreItem logo={ReactionLogo} name="Reaction" score={80} primaryColor="red" />
              <SkillScoreItem logo={MemoryLogo} name="Memory" score={92} primaryColor="yellow" />
              <SkillScoreItem logo={VerbalLogo} name="Verbal" score={61} primaryColor="green" />
              <SkillScoreItem logo={VisualLogo} name="Visual" score={72} primaryColor="purple" />
            </ul>
            <div className="btn-container">
              <button className="btn-continue">Continue</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
