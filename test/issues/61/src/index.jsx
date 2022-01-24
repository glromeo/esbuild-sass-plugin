import * as React from "react";
import ReactDOM from "react-dom";
import Swiper, {Navigation, Pagination} from 'swiper';
import 'swiper/scss';

import 'swiper/scss/navigation';
import 'swiper/css/pagination';

Swiper.use([Navigation, Pagination]);

function App() {
    return (
        <div className="swiper">
            <div className="swiper-wrapper">
                <div className="swiper-slide">Slide 1</div>
                <div className="swiper-slide">Slide 2</div>
                <div className="swiper-slide">Slide 3</div>
            </div>
            <div className="swiper-pagination"/>
            <div className="swiper-button-prev"/>
            <div className="swiper-button-next"/>
            <div className="swiper-scrollbar"/>
        </div>
    )
}

ReactDOM.render(<App/>, document.querySelector("#app"));