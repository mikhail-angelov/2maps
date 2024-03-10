import { html } from '../libs/htm.js';

export const IconButton = ({
  icon, onClick, disabled, className, ...other
}) => html`<button class="${
  className || ''
}" onClick=${onClick} ...${other} disabled=${disabled}>
  <img src=${icon}></img>
</button>`;

export const SmallIconButton = ({
  icon,
  onClick,
  disabled,
  className,
  ...other
}) => html`<button class="${className || ''}" style=${{
  margin: 1,
  padding: 0,
  background: 'transparent',
}} onClick=${onClick} ...${other} disabled=${disabled}>
  <img src=${icon}></img>
</button>`;

export const Button = ({
  icon, onClick, disabled, className, ...other
}) => html`<button class="${disabled ? 'disabled' : ''} ${
  className || ''
}" onClick=${onClick} ...${other} disabled=${disabled}>
  <img src=${icon}></img>
</button>`;
