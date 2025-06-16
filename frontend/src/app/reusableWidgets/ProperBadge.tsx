import { Variant } from "react-bootstrap/esm/types";

interface ProperBadgeProps {
  children: React.ReactNode;
  capitalize?: boolean;
  variant: Variant
}

type ProperBadgeComponent = (props: ProperBadgeProps) => React.ReactNode

const ProperBadge: ProperBadgeComponent = ({ children, capitalize = true, ...props }) => {
  return (
    <span className={`badge badge-light-${props.variant}`}>
      {capitalize && typeof children === 'string' ? children.charAt(0).toUpperCase() + children.slice(1) : children}
    </span>
  )
}

export default ProperBadge

