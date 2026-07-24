import { Icon } from "@iconify/react";

function LoadingIcon({ dimensions }) {
  return(
    <>
      <Icon icon="gg:spinner" className={`text-[#1B651B] animate-spin ${dimensions}`} />
    </>
  );
}

export default LoadingIcon;