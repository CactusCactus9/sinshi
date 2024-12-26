import "./TourFinalScore.css"
import { MdOutlineRestartAlt } from "react-icons/md";
import { HiMiniTrophy } from "react-icons/hi2";
// import { SlBadge } from "react-icons/sl";
import { Link, useLocation } from "react-router-dom";


function TourFinalScore(){
    const { state } = useLocation();
    const winner = state;
    return(
        <div className="levels-container">
            <div className="level-box">
                <div className="tour-level">
                    <span>Congratulations!</span>
                    <HiMiniTrophy/>
                    <span>{winner}</span>
                </div> 
                    <Link className="restart-icon" to={`/game/Local/TournamentLocal`}><MdOutlineRestartAlt/></Link>
            </div>
        </div>
    );
}

export default TourFinalScore;