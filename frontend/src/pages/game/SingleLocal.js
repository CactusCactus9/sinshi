
import './SingleLocal.css'
import { Link } from "react-router-dom";

function SingleLocal() {
    return (
        <div className='SingleLocal-background'>
            {/* <div className="SingleLocal-container">
                <div className="SingleLocal-icon"></div>
            </div>
            <div className="SingleLocal-container">
                <div className='vs'>
                    <span class="Sv">V</span>
                    <span class="Ss">S</span>
                </div>
            </div> */}
            <div className="SingleLocal-container">
                {/* <div className='b'> */}
                    <Link className='solo' to={`/game/Local/SingleGame/SoloPractice`}>Solo Practice</Link>
                    <Link className='ch'to={`/game/Local/SingleGame/ChallengeAFriend`}>Challenge a Friend</Link>
                {/* </div> */}
            </div>
        </div>
    );
}
export default SingleLocal;
