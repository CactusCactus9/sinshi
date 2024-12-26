import "./FourVsFour.css"
import { GiPingPongBat } from "react-icons/gi";

function FourVsFour() {
    return (
        <div className="FourVsFour-background">
            <div className="FourVsFour-container">
                <div className="FourVsFour-container">
                    <div className="FourVsFour-icon"></div>
                    <p className="FourName">Name</p>
                </div>
                <div className="FourVsFour-container">
                    <div className="FourVsFour-icon"></div>
                    <p className="FourName">Name</p>
                </div>
            </div>
            <div className="FourVsFour-container">
                <span className="FourV">V</span>
                <span className="FourS">S</span>
                <div className="FourVsFour-button">
                    <button className="FourVsFour-b"> <GiPingPongBat /> <span className="Play">PLAY</span></button>
                </div>
            </div>
            <div className="FourVsFour-container">
                <div className="FourVsFour-container">
                    <div className="FourVsFour-icon"></div>
                    <p className="FourName">Name</p>
                </div>
                <div className="FourVsFour-container">
                    <div className="FourVsFour-icon"></div>
                    <p className="FourName">Name</p>
                </div>
            </div>
        </div>
    );
}
export default FourVsFour;