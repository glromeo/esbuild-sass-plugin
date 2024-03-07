import { message } from "./example.module.scss";
import * as common from "./common.module.scss";

document.body.insertAdjacentHTML("afterbegin", `
    <div class="${message} ${common.message}">Hello World</div>
`);