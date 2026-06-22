import { Icon } from "@iconify/react";

function UserIcon({ dimensions, typography }) {
  return(
    <Icon
      icon="akar-icons:person"
      className={`${dimensions} ${typography}`}
    />
  );
}

export default UserIcon;