import { message as stylesMessage } from "./example.module.scss";
import { message as commonMessage } from "./common.module.scss";

document.body.insertAdjacentHTML(
	"afterbegin",
	`<div class="${stylesMessage} ${commonMessage}">Hello World</div>`,
);
