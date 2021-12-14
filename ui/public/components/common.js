import { html } from "../libs/htm.js";

export const IconButton = ({ icon, onClick, disabled, className, ...other }) =>
  html`<button class="icon-button ${disabled ? 'disabled' : ''} ${className ? className : ''}" onClick=${onClick} ...${other} disabled=${disabled}>
  <img src=${icon}></img>
</button>`;
