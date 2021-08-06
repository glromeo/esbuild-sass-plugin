import React from "react"
import ReactDOM from "react-dom"

import Red from "./red/stroke.jsx";
import Green from "./green/stroke.jsx";
import Blue from "./blue/stroke.jsx";

import "./index.scss";

function App() {
    return (
        <div>
            <Red/>
            <Green/>
            <Blue/>
            <div className="stroke" />
        </div>
    );
}

ReactDOM.render(<App/>, document.getElementById("app"));
