import './Local.css';
// import Banner from '../../components/Banner';
import { FiPlay } from "react-icons/fi";
import { Link } from "react-router-dom";
// import Game from './Game';


function Local() {
  return (
    <>
    <div className='menu-background'>
      {/* <div className="Ban_Local"><Banner/></div> */}
      <div className='menu-container'>
        {/* <div className='logo'>
          <p>
            <sup>
              <span>P</span>
              <span className='o'></span>
              <span>N</span>

            </sup>
            <span className='g'>G</span>
            <span>AME</span>
          </p>
        </div> */}
        {/* <div className='menu-buttons'> */}
          <Link className='local-button' to={`/game/Local/SingleGame`}><FiPlay /><span className='local-title' >Single Game</span></Link>
          <Link className='local-button' to={`/game/Local/TournamentLocal`}><FiPlay /><span className='local-title'>Tournament</span></Link>
        {/* </div> */}
      </div>
    </div>
    </>
  );
}

export default Local;
